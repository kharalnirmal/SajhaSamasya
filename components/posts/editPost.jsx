"use client";

import { useState } from "react";
import { Pencil, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DISTRICTS, CATEGORIES } from "@/lib/constants";

const CATEGORY_OPTIONS = [
  { value: "road", label: "Road / Infrastructure" },
  { value: "water", label: "Water Supply" },
  { value: "electricity", label: "Electricity" },
  { value: "garbage", label: "Garbage / Waste" },
  { value: "safety", label: "Public Safety" },
  { value: "other", label: "Other" },
];

const TARGET_GROUPS = [
  { value: "authority", label: "Official Authority" },
  { value: "volunteer", label: "Community Volunteers" },
  { value: "both", label: "Both (Maximum reach)" },
];

export default function EditPost({ post, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(post.title || "");
  const [description, setDescription] = useState(post.description || "");
  const [category, setCategory] = useState(post.category || "");
  const [targetGroup, setTargetGroup] = useState(
    post.targetGroup || "authority",
  );
  const [district, setDistrict] = useState(post.district || "");

  // Reset form to current post data when dialog opens
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setTitle(post.title || "");
      setDescription(post.description || "");
      setCategory(post.category || "");
      setTargetGroup(post.targetGroup || "authority");
      setDistrict(post.district || "");
    }
    setOpen(isOpen);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Title, description and category are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          targetGroup,
          district,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Post updated successfully");
        setOpen(false);
        onUpdated?.(data.post);
      } else {
        toast.error(data.error || "Failed to update post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl px-3 py-2 transition"
          title="Edit post"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update the details of your report. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Post title"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe the issue"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition resize-none"
            />
          </div>

          {/* Category & District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition appearance-none cursor-pointer"
              >
                <option value="">Select</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition appearance-none cursor-pointer"
              >
                <option value="">Select</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Group */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Target Group
            </label>
            <div className="flex gap-2 flex-wrap">
              {TARGET_GROUPS.map((tg) => (
                <button
                  key={tg.value}
                  type="button"
                  onClick={() => setTargetGroup(tg.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition ${
                    targetGroup === tg.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {tg.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
