"use client";
import { useState, useMemo } from "react";

import { classOptionsForRole, isClassValidForRole } from "@/lib/classes";
import { useI18n } from "@/lib/i18n/store";
import { DEFAULT_TIERS } from "@/lib/models";
import type { Build, Role } from "@/lib/models";

import { Button, Input, Label, Select, Card, Row, PrimaryButton, Textarea } from "./ui";

type Props = {
  initial?: Partial<Build>;
  onSubmit: (data: Omit<Build, "id" | "createdAt" | "updatedAt" | "likes">) => void | Promise<void>;
};

export default function BuildForm({ initial, onSubmit }: Props) {
  const { t } = useI18n();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [realm] = useState(initial?.realm ?? "BronzeBeard");
  const [role, setRole] = useState<Role>((initial?.role as Role) ?? "Caster/Range");
  const [classTag, setClassTag] = useState<string>(initial?.classTag ?? "Mage");
  const [tiersStr, setTiersStr] = useState((initial?.tiers ?? DEFAULT_TIERS).join(","));
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [commentsEnabled, setCommentsEnabled] = useState(initial?.commentsEnabled ?? false);
  const [description, setDescription] = useState<string>(initial?.description ?? "");

  const classOptions = useMemo(() => classOptionsForRole(role), [role]);

  function onRoleChange(next: string) {
    const nextRole = next as Role;
    setRole(nextRole);
    // si la classe sélectionnée n'est pas compatible avec le rôle choisi, on la réinitialise
    if (!isClassValidForRole(nextRole, classTag)) setClassTag("");
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">{t("common.title")}</Label>
          <Input
            id="title"
            placeholder="Twilight Parangon Priest"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Short description (≤ 3000)</Label>
          <Textarea
            id="description"
            maxLength={3000}
            placeholder="What is this build about? rotation, synergy, goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500">{description.length}/3000</p>
        </div>
        <Row>
          <div className="w-48">
            <Label htmlFor="role">{t("common.role")}</Label>
            <Select id="role" value={role} onChange={(e) => onRoleChange(e.target.value)}>
              <option value="Caster/Range">Caster/Range</option>
              <option value="Melee">Melee</option>
              <option value="Tank">Tank</option>
              <option value="Healer">Healer</option>
            </Select>
          </div>
          <div className="w-56">
            <Label htmlFor="class">{t("common.class")}</Label>
            <Select id="class" value={classTag} onChange={(e) => setClassTag(e.target.value)}>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </Row>
        <div>
          <Label htmlFor="tiers">{t("common.tiers")}</Label>
          <Input id="tiers" value={tiersStr} onChange={(e) => setTiersStr(e.target.value)} />
          <p className="mt-1 text-xs text-neutral-500">Ex: Raid,M0,M+&lt;10,M+10-14,M+15+</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vis">{t("form.visibility")}</Label>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                id="vis"
                type="radio"
                name="vis"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
              <span>{t("common.public")} (list in Explorer)</span>
            </label>
            <label htmlFor="vis-private" className="flex items-center gap-2">
              <input
                id="vis-private"
                type="radio"
                name="vis"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              <span>{t("common.private")} (local only)</span>
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="comments" className="flex items-center gap-2 text-sm">
            <input
              id="comments"
              type="checkbox"
              disabled={!isPublic}
              checked={commentsEnabled}
              onChange={(e) => setCommentsEnabled(e.target.checked)}
            />
            <span>{t("form.enableComments")}</span>
          </label>
        </div>
        <Row>
          <PrimaryButton
            onClick={() => {
              const tiers = tiersStr
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean) as Build["tiers"];
              onSubmit({
                title,
                realm,
                role,
                classTag: classTag || undefined,
                tiers,
                isPublic,
                commentsEnabled: isPublic ? commentsEnabled : false,
                description: description || null,
              });
            }}
          >
            {t("common.save")}
          </PrimaryButton>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => {
              setTitle("");
            }}
          >
            {t("common.reset")}
          </Button>
        </Row>
      </div>
    </Card>
  );
}
