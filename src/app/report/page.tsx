"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Camera,
  MapPin,
  Upload,
  X,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ReportPage() {
  const [image, setImage] = useState<string | null>(null);
  const [incidentType, setIncidentType] = useState("");
  const [severity, setSeverity] = useState("");

  const handleImageChange = (file?: File) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    toast.success("Incident reported successfully", {
      description:
        "Your report has been recorded and is ready for response.",
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Report an Incident</h1>

          <p className="mt-2 text-muted-foreground">Provide the details below so the appropriate response team can assist you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident details</CardTitle>
              <p className="text-sm text-muted-foreground">Tell us what happened.</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Incident type</Label>

                  <Select
                    value={incidentType}
                    onValueChange={setIncidentType}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="accident">Road Accident</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="medical">Medical Emergency</SelectItem>
                      <SelectItem value="crime">Crime / Security</SelectItem>
                      <SelectItem value="natural">Natural Disaster</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>

                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>

                <Textarea
                  id="description"
                  placeholder="Describe what happened, who may be affected, and any other important information..."
                  className="min-h-32 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident location</CardTitle>
              <p className="text-sm text-muted-foreground">Where did the incident occur?</p>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">Greater Noida, Uttar Pradesh</p>
                  <p className="text-sm text-muted-foreground">Location detected · Mock location</p>
                </div>

                <Button type="button" variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo or evidence</CardTitle>
              <p className="text-sm text-muted-foreground">Add an image if it can help responders understand the situation.</p>
            </CardHeader>

            <CardContent>
              {image ? (
                <div className="relative overflow-hidden rounded-xl border">
                  <img
                    src={image}
                    alt="Incident evidence preview"
                    className="max-h-80 w-full object-cover"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-3"
                    onClick={() => setImage(null)}
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
                      <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0])
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
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0])
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
                <p className="text-sm text-muted-foreground">Your report will be recorded for emergency response.</p>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="destructive"
                className="sm:min-w-48"
              >
                <AlertTriangle />
                Submit Incident
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}