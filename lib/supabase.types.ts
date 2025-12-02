export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      build_enchants: {
        Row: {
          build_id: string | null;
          cost: number | null;
          enchant_id: number | null;
          href: string | null;
          id: string;
          name: string;
          notes: string | null;
          rarity: string;
          slot: string;
        };
        Insert: {
          build_id?: string | null;
          cost?: number | null;
          enchant_id?: number | null;
          href?: string | null;
          id: string;
          name: string;
          notes?: string | null;
          rarity: string;
          slot: string;
        };
        Update: {
          build_id?: string | null;
          cost?: number | null;
          enchant_id?: number | null;
          href?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          rarity?: string;
          slot?: string;
        };
        Relationships: [
          {
            foreignKeyName: "build_enchants_build_id_fkey";
            columns: ["build_id"];
            isOneToOne: false;
            referencedRelation: "builds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "build_enchants_enchant_id_fkey";
            columns: ["enchant_id"];
            isOneToOne: false;
            referencedRelation: "mystic_enchants";
            referencedColumns: ["id"];
          },
        ];
      };
      build_items: {
        Row: {
          build_id: string | null;
          href: string | null;
          id: string;
          item_id: number | null;
          name: string;
          notes: string | null;
          rank: number;
          slot: string;
          source: string | null;
          stats: Json;
          tier: string;
        };
        Insert: {
          build_id?: string | null;
          href?: string | null;
          id: string;
          item_id?: number | null;
          name: string;
          notes?: string | null;
          rank?: number;
          slot: string;
          source?: string | null;
          stats?: Json;
          tier: string;
        };
        Update: {
          build_id?: string | null;
          href?: string | null;
          id?: string;
          item_id?: number | null;
          name?: string;
          notes?: string | null;
          rank?: number;
          slot?: string;
          source?: string | null;
          stats?: Json;
          tier?: string;
        };
        Relationships: [
          {
            foreignKeyName: "build_items_build_id_fkey";
            columns: ["build_id"];
            isOneToOne: false;
            referencedRelation: "builds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "build_items_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      builds: {
        Row: {
          class_tag: string | null;
          comments_enabled: boolean;
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean;
          likes: number;
          owner: string | null;
          realm: string;
          role: string;
          tier_order: Json;
          title: string;
          updated_at: string;
        };
        Insert: {
          class_tag?: string | null;
          comments_enabled?: boolean;
          created_at?: string;
          description?: string | null;
          id: string;
          is_public?: boolean;
          likes?: number;
          owner?: string | null;
          realm: string;
          role: string;
          tier_order?: Json;
          title: string;
          updated_at?: string;
        };
        Update: {
          class_tag?: string | null;
          comments_enabled?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          likes?: number;
          owner?: string | null;
          realm?: string;
          role?: string;
          tier_order?: Json;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "builds_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      items: {
        Row: {
          classID: number | null;
          difficulty: string | null;
          icon: string | null;
          id: number;
          ilvl: number | null;
          inventoryType: number | null;
          itemClass: string | null;
          itemSubClass: string | null;
          name: string | null;
          quality: number | null;
          qualityText: string | null;
          reqLevel: number | null;
          sellPrice: number | null;
          slot: string | null;
          stats: Json | null;
          subClass: string | null;
          subClassID: number | null;
        };
        Insert: {
          classID?: number | null;
          difficulty?: string | null;
          icon?: string | null;
          id: number;
          ilvl?: number | null;
          inventoryType?: number | null;
          itemClass?: string | null;
          itemSubClass?: string | null;
          name?: string | null;
          quality?: number | null;
          qualityText?: string | null;
          reqLevel?: number | null;
          sellPrice?: number | null;
          slot?: string | null;
          stats?: Json | null;
          subClass?: string | null;
          subClassID?: number | null;
        };
        Update: {
          classID?: number | null;
          difficulty?: string | null;
          icon?: string | null;
          id?: number;
          ilvl?: number | null;
          inventoryType?: number | null;
          itemClass?: string | null;
          itemSubClass?: string | null;
          name?: string | null;
          quality?: number | null;
          qualityText?: string | null;
          reqLevel?: number | null;
          sellPrice?: number | null;
          slot?: string | null;
          stats?: Json | null;
          subClass?: string | null;
          subClassID?: number | null;
        };
        Relationships: [];
      };
      mystic_enchants: {
        Row: {
          class: string | null;
          description: string | null;
          id: number;
          level: number | null;
          name: string;
          rarity: string;
        };
        Insert: {
          class?: string | null;
          description?: string | null;
          id: number;
          level?: number | null;
          name: string;
          rarity: string;
        };
        Update: {
          class?: string | null;
          description?: string | null;
          id?: number;
          level?: number | null;
          name?: string;
          rarity?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          id: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          id: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      unaccent: { Args: { "": string }; Returns: string };
    };
    Enums: {
      rarity_enum: "Rare" | "Epic" | "Legendary" | "Artifact";
      wow_class_enum:
        | "Warrior"
        | "Paladin"
        | "Hunter"
        | "Rogue"
        | "Priest"
        | "DeathKnight"
        | "Shaman"
        | "Mage"
        | "Warlock"
        | "Druid"
        | "Any";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      rarity_enum: ["Rare", "Epic", "Legendary", "Artifact"],
      wow_class_enum: [
        "Warrior",
        "Paladin",
        "Hunter",
        "Rogue",
        "Priest",
        "DeathKnight",
        "Shaman",
        "Mage",
        "Warlock",
        "Druid",
        "Any",
      ],
    },
  },
} as const;
