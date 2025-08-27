"use client";
import { useState } from "react";
import { DEFAULT_TIERS, WOW_CLASSES } from "@/lib/models";
import type { Build } from "@/lib/models";
import { Button, Input, Label, Select, Card, Row, PrimaryButton } from "./ui";
import { useI18n } from "@/lib/i18n/store";

type Props = { initial?: Partial<Build>; onSubmit: (data: Omit<Build, 'id' | 'createdAt' | 'updatedAt' | 'likes'>) => void | Promise<void>; };

export default function BuildForm({ initial, onSubmit }: Props) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [realm, setRealm] = useState(initial?.realm ?? "BronzeBeard");
  const [role, setRole] = useState<Build['role']>(initial?.role ?? "Caster/Range");
  const [classTag, setClassTag] = useState<string>(initial?.classTag ?? "Mage");
  const [tiersStr, setTiersStr] = useState((initial?.tiers ?? DEFAULT_TIERS).join(","));
  const [isPublic, setIsPublic] = useState((initial as any)?.isPublic ?? false);
  const [commentsEnabled, setCommentsEnabled] = useState((initial as any)?.commentsEnabled ?? false);

  return (
    <Card>
      <div className="space-y-4">
        <div><Label>{t('common.title')}</Label><Input placeholder="Shadow DoT — BronzeBeard" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <Row>
          <div className="grow"><Label>{t('common.realm')}</Label><Input placeholder="BronzeBeard / CoA" value={realm} onChange={e => setRealm(e.target.value)} /></div>
          <div className="w-48"><Label>{t('common.role')}</Label><Select value={role} onChange={e => setRole(e.target.value as any)}>
            <option value="Caster/Range">Caster/Range</option><option value="Melee">Melee</option><option value="Tank">Tank</option><option value="Healer">Healer</option>
          </Select></div>
          <div className="w-56"><Label>{t('common.class')}</Label><Select value={classTag} onChange={e => setClassTag(e.target.value)}>{WOW_CLASSES.map(c => (<option key={c} value={c}>{c}</option>))}</Select></div>
        </Row>
        <div><Label>{t('common.tiers')}</Label><Input value={tiersStr} onChange={e => setTiersStr(e.target.value)} /><p className="text-xs text-neutral-500 mt-1">Ex: Raid,M0,M+&lt;10,M+10-14,M+15+</p></div>
        <div className="space-y-2">
          <Label>{t('form.visibility')}</Label>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="radio" name="vis" checked={isPublic} onChange={() => setIsPublic(true)} /><span>{t('common.public')} (list in Explorer)</span></label>
            <label className="flex items-center gap-2"><input type="radio" name="vis" checked={!isPublic} onChange={() => setIsPublic(false)} /><span>{t('common.private')} (local only)</span></label>
          </div>
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" disabled={!isPublic} checked={commentsEnabled} onChange={e => setCommentsEnabled(e.target.checked)} />
            <span>{t('form.enableComments')}</span>
          </label>
        </div>
        <Row>
          <PrimaryButton onClick={() => {
            const tiers = tiersStr.split(",").map(s => s.trim()).filter(Boolean) as any;
            onSubmit({ title, realm, role, classTag, tiers, isPublic, commentsEnabled: isPublic ? commentsEnabled : false });
          }}>{t('common.save')}</PrimaryButton>
          <Button onClick={() => { setTitle(""); }}>{t('common.reset')}</Button>
        </Row>
      </div>
    </Card>
  );
}
