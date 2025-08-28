"use client";
import { useCallback, useEffect, useState } from "react";

import type { Build, Comment } from "@/lib/models";
import { listComments, addComment, deleteComment } from "@/lib/storage";

import { Button, Label, Card, Textarea } from "./ui";

function CommentItem({
  c,
  onReply,
  onDelete,
}: {
  c: Comment;
  onReply: (parent: Comment) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="text-sm text-neutral-500">
        {new Date(c.createdAt).toLocaleString()} •{" "}
        {/* <span className="font-medium">{c.authorName}</span> */}
      </div>
      <div className="mt-1 whitespace-pre-wrap">{c.body}</div>
      <div className="mt-2 flex gap-3 text-sm">
        <button className="underline" onClick={() => onReply(c)}>
          Reply
        </button>
        <button className="underline" onClick={() => onDelete(c.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function CommentThread({ build }: { build: Build }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const refresh = useCallback(async () => {
    {
      setComments(await listComments(build.id));
    }
  }, [build.id]);

  useEffect(() => {
    refresh();
  }, [build.id, refresh]);

  async function submit() {
    if (!author || !body) return;
    await addComment(build.id, author, body, replyTo?.id || undefined);
    setAuthor("");
    setBody("");
    setReplyTo(null);
    await refresh();
  }

  function treeify(list: Comment[]) {
    const map: Record<string, Comment & { children: Comment[] }> = {};
    list.forEach((c) => (map[c.id] = { ...c, children: [] }));
    const roots: (Comment & { children: Comment[] })[] = [];
    list.forEach((c) => {
      if (c.parentId && map[c.parentId]) map[c.parentId].children.push(map[c.id]);
      else roots.push(map[c.id]);
    });
    return roots;
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    await deleteComment(id);
    await refresh();
  }
  const roots = treeify(comments);
  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-2">
          <Label>New comment</Label>
          {/* {replyTo && (
            <div className="text-xs text-neutral-500">
              Replying to <span className="font-medium">{replyTo.authorName}</span> —{" "}
              <button className="underline" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </div>
          )} */}
          <Textarea
            placeholder="Your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button onClick={submit}>Post</Button>
        </div>
      </Card>
      <div className="space-y-2">
        {roots.map((r) => (
          <div key={r.id} className="space-y-2">
            <CommentItem c={r} onReply={setReplyTo} onDelete={onDelete} />
            {r.children.length > 0 && (
              <div className="space-y-2 border-l border-neutral-300 pl-4 dark:border-neutral-700">
                {r.children.map((ch) => (
                  <CommentItem key={ch.id} c={ch} onReply={setReplyTo} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>
        ))}
        {roots.length === 0 && <p className="text-sm text-neutral-500">No comments.</p>}
      </div>
    </div>
  );
}
