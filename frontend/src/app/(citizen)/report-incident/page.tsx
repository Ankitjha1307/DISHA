"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  LocateFixed,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IncidentStatusBadge } from "@/components/shared/incident-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, ApiClientError } from "@/lib/api";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABELS,
  type IncidentCategory,
  type IncidentRecord,
} from "@/types/incident";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ReportIncidentPage() {
  const [category, setCategory] = useState<IncidentCategory | "">("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdIncident, setCreatedIncident] =
    useState<IncidentRecord | null>(null);

  useEffect(() => {
    if (!imagePreview) {
      return;
    }

    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleImageChange = (file?: File) => {
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleUseCurrentLocation = () => {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError(
        "Geolocation is not available in this browser. Enter the location and coordinates manually."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationLabel((current) =>
          current.trim() ? current : "Current location captured by browser"
        );
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setError(
          "Could not access your location. Check browser permission or enter the location manually."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resetForm = () => {
    setCategory("");
    setDescription("");
    setLocationLabel("");
    setLatitude("");
    setLongitude("");
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!category) {
      setError("Select an incident category.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Describe the incident in at least 10 characters.");
      return;
    }

    if (locationLabel.trim().length < 3) {
      setError("Enter a location or landmark for the incident.");
      return;
    }

    const hasLatitude = latitude.trim().length > 0;
    const hasLongitude = longitude.trim().length > 0;

    if (hasLatitude !== hasLongitude) {
      setError("Enter both latitude and longitude, or leave both blank.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("locationLabel", locationLabel.trim());

      if (hasLatitude && hasLongitude) {
        formData.append("latitude", latitude.trim());
        formData.append("longitude", longitude.trim());
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const data = await apiFetch<{ incident: IncidentRecord }>(
        "/api/incidents",
        {
          method: "POST",
          body: formData,
        }
      );

      setCreatedIncident(data.incident);
      resetForm();
      toast.success(`Report ${data.incident.reportId} submitted`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to submit the report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="citizen">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Report an incident
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Provide the details below so a demo officer can review the report.
            DISHA does not contact emergency services or dispatch real help.
          </p>
        </div>

        {createdIncident ? (
          <Card
            aria-live="polite"
            className="border-emerald-500/30 bg-emerald-500/5"
          >
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Report submitted</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Your report was saved with ID{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {createdIncident.reportId}
                    </span>
                    . An officer can now review it in the demo queue.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <IncidentStatusBadge status={createdIncident.status} />
                <Button asChild>
                  <Link href={`/my-reports/${createdIncident.id}`}>
                    View report
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatedIncident(null)}
                >
                  Report another incident
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Incident details</CardTitle>
                <CardDescription>Tell us what happened.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Incident category</Label>

                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as IncidentCategory)
                    }
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select incident category" />
                    </SelectTrigger>

                    <SelectContent>
                      {INCIDENT_CATEGORIES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {INCIDENT_CATEGORY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">
                      {description.length}/2000
                    </span>
                  </div>

                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what happened, who may be affected, and any other important information..."
                    className="min-h-32 resize-y"
                    maxLength={2000}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />

                  <p className="text-xs text-muted-foreground">
                    At least 10 characters. Do not include personal information
                    that is not needed for the incident.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident location</CardTitle>
                <CardDescription>
                  Enter a clear landmark. You can optionally capture browser
                  coordinates or type them manually.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="location-label">Location or landmark</Label>
                  <Input
                    id="location-label"
                    name="locationLabel"
                    className="h-10"
                    placeholder="For example: Alpha 2 Market, near the main gate"
                    maxLength={240}
                    value={locationLabel}
                    onChange={(event) => setLocationLabel(event.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="size-5 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Use your current location
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        The browser asks for permission first. Coordinates are
                        optional.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <Loader2 className="motion-safe:animate-spin" />
                    ) : (
                      <LocateFixed />
                    )}
                    {locating ? "Locating…" : "Capture location"}
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (optional)</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={-90}
                      max={90}
                      placeholder="28.4744"
                      className="h-10"
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (optional)</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={-180}
                      max={180}
                      placeholder="77.5040"
                      className="h-10"
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                    />
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  If coordinates are missing, the report is still accepted but
                  proximity-based resource recommendations will be unavailable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photo or evidence</CardTitle>
                <CardDescription>
                  Add an image if it can help an officer understand the
                  situation. The image is optional.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-xl border">
                    {/* Local object URL preview; next/image is not needed here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Incident evidence preview"
                      className=" max-h-80 w-full object-cover"
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute top-3 right-3"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors hover:bg-muted/50">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Upload className="size-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-medium">Upload an image</p>
                        <p className="text-sm text-muted-foreground">
                          JPEG, PNG or WebP up to 5 MB
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) =>
                          handleImageChange(event.target.files?.[0])
                        }
                      />
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors hover:bg-muted/50">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Camera className="size-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-medium">Take a photo</p>
                        <p className="text-sm text-muted-foreground">
                          Use your device camera
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        className="hidden"
                        onChange={(event) =>
                          handleImageChange(event.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Ready to submit?</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    The report is saved in the demo database. It does not notify
                    emergency services.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="destructive"
                  className="sm:min-w-48"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="motion-safe:animate-spin" />
                  ) : (
                    <AlertTriangle />
                  )}
                  {submitting ? "Submitting…" : "Submit incident"}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
