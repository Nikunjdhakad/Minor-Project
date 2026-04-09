import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, User, Mail, Sparkles, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { API_BASE_URL } from "@/config";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  stylePreference: z.string().min(1, { message: "Please select a style preference." }),
  fitPreference: z.string().refine((val) => ["slim", "regular", "relaxed"].includes(val), { message: "Please select a fit." }),
  termsReady: z.boolean().refine((val) => val === true, { message: "You must accept the terms." }),
});

export default function ProfileSetupPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { user, loginUser } = useAppContext();

  const hasProfileData = !!(user && user.stylePreference && (user.name || user.fullName));
  const [isEditing, setIsEditing] = useState(!hasProfileData);

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.name || user?.fullName || "",
      email: user?.email || "",
      stylePreference: user?.stylePreference || "",
      fitPreference: user?.fitPreference || "",
      termsReady: false,
    },
    mode: "onChange",
  });

  async function onSubmit(data) {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Save to backend API
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          stylePreference: data.stylePreference,
          fitPreference: data.fitPreference,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      // Update local state with backend response + keep token
      const updatedUser = { ...result, token: user.token };
      loginUser(updatedUser);

      setIsSuccess(true);
      setIsEditing(false);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (error) {
      console.error("Profile update error:", error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function onReset() {
    form.reset();
  }

  return (
    <div className="container mx-auto p-4 py-12 max-w-2xl min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Complete Your Profile</h1>
        <p className="text-muted-foreground text-lg">
          Tell us about yourself to get perfectly tailored style recommendations.
        </p>
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl mt-4 max-w-md mx-auto font-medium">
            Profile updated successfully!
          </motion.div>
        )}
        {saveError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl mt-4 max-w-md mx-auto font-medium">
            {saveError}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-10 shadow-2xl"
      >
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10 bg-background/50 h-12 rounded-xl text-base" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="email" placeholder="john@example.com" className="pl-10 bg-background/50 h-12 rounded-xl text-base" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid sm:grid-cols-2 gap-8">
                <FormField control={form.control} name="stylePreference" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Style Preference</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <select
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                          {...field}
                        >
                          <option value="" disabled>Select a style...</option>
                          <option value="minimalist">Minimalist</option>
                          <option value="streetwear">Streetwear</option>
                          <option value="vintage">Vintage / Retro</option>
                          <option value="formal">Business Formal</option>
                          <option value="casual">Smart Casual</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="fitPreference" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Preferred Fit</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["slim", "regular", "relaxed"].map((fit) => (
                          <label key={fit} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input type="radio" value={fit} checked={field.value === fit} onChange={field.onChange} className="peer sr-only" />
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground peer-checked:border-primary peer-checked:bg-primary transition-all" />
                              <div className="absolute w-2 h-2 rounded-full bg-background opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-sm font-medium capitalize text-muted-foreground group-hover:text-foreground transition-colors">
                              {fit}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="termsReady" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/50 bg-background/20 p-4 shadow-sm">
                  <FormControl>
                    <label htmlFor="profile-terms" className="relative flex items-center justify-center pt-1 cursor-pointer">
                      <input id="profile-terms" type="checkbox" checked={field.value} onChange={field.onChange} className="peer sr-only" />
                      <div className="w-5 h-5 rounded-md border-2 border-muted-foreground peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </label>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <label htmlFor="profile-terms" className="text-sm font-medium cursor-pointer text-foreground hover:text-primary transition-colors">
                      Accept Terms and Conditions
                    </label>
                    <FormDescription className="text-xs">
                      You agree to our Terms of Service and Privacy Policy.
                    </FormDescription>
                    {form.formState.errors.termsReady && (
                      <p className="text-[0.8rem] font-medium text-destructive mt-1">{form.formState.errors.termsReady.message}</p>
                    )}
                  </div>
                </FormItem>
              )} />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
                {hasProfileData ? (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-none sm:w-32 h-12 rounded-xl text-base font-medium border-border/50 bg-background/50 hover:bg-muted transition-colors">
                    Cancel
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={onReset} className="flex-none sm:w-32 h-12 rounded-xl text-base font-medium border-border/50 bg-background/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-lg mx-auto sm:mx-0">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.fullName || "User")}&background=random`} alt="User Avatar" className="h-full w-full rounded-full object-cover border-4 border-background" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{user?.name || user?.fullName || "Your Profile"}</h2>
                <p className="text-muted-foreground">{user?.email || "No email provided"}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Style Preference</p>
                <p className="text-lg font-semibold capitalize">{user?.stylePreference || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fit Preference</p>
                <p className="text-lg font-semibold capitalize">{user?.fitPreference || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                <p className="text-lg font-semibold capitalize text-primary flex items-center justify-center sm:justify-start gap-2">
                  Active <Check className="w-5 h-5 bg-primary/20 rounded-full p-1" />
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.05] transition-transform">
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}