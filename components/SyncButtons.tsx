"use client";
import type { Build } from "@/lib/models";
import { uploadBuild } from "@/lib/remote";
import { listItems, listEnchants } from "@/lib/storage";

import { Button, Row } from "./ui";
export default function SyncButtons({ build }: { build: Build }) {
  async function push() {
    try {
      const items = await listItems(build.id);
      const ench = await listEnchants(build.id);
      await uploadBuild(build, items, ench);
      alert("Upload OK");
    } catch (e) {
      alert(String(e));
    }
  }
  return (
    <Row>
      <Button onClick={push}>⬆️ Upload</Button>
    </Row>
  );
}
