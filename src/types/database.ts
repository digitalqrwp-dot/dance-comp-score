export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            athlete_documents: {
                Row: {
                    athlete_id: string | null
                    bucket_path: string
                    created_at: string | null
                    doc_type: string
                    expiry_date: string | null
                    id: string
                    updated_at: string | null
                }
                Insert: {
                    athlete_id?: string | null
                    bucket_path: string
                    created_at?: string | null
                    doc_type: string
                    expiry_date?: string | null
                    id?: string
                    updated_at?: string | null
                }
                Update: {
                    athlete_id?: string | null
                    bucket_path?: string
                    created_at?: string | null
                    doc_type?: string
                    expiry_date?: string | null
                    id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "athlete_documents_athlete_id_fkey"
                        columns: ["athlete_id"]
                        isOneToOne: false
                        referencedRelation: "athletes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            athletes: {
                Row: {
                    club_name: string | null
                    created_at: string | null
                    first_name: string
                    id: string
                    last_name: string
                    tax_id: string
                    updated_at: string | null
                }
                Insert: {
                    club_name?: string | null
                    created_at?: string | null
                    first_name: string
                    id?: string
                    last_name: string
                    tax_id: string
                    updated_at?: string | null
                }
                Update: {
                    club_name?: string | null
                    created_at?: string | null
                    first_name?: string
                    id?: string
                    last_name?: string
                    tax_id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            competition_rounds: {
                Row: {
                    competition_id: string | null
                    created_at: string | null
                    id: string
                    order_index: number
                    round_type: Database["public"]["Enums"]["round_type"]
                    status: string | null
                }
                Insert: {
                    competition_id?: string | null
                    created_at?: string | null
                    id?: string
                    order_index: number
                    round_type: Database["public"]["Enums"]["round_type"]
                    status?: string | null
                }
                Update: {
                    competition_id?: string | null
                    created_at?: string | null
                    id?: string
                    order_index?: number
                    round_type?: Database["public"]["Enums"]["round_type"]
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "competition_rounds_competition_id_fkey"
                        columns: ["competition_id"]
                        isOneToOne: false
                        referencedRelation: "competitions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            competitions: {
                Row: {
                    category: Database["public"]["Enums"]["competition_category"]
                    created_at: string | null
                    current_phase: Database["public"]["Enums"]["competition_phase"] | null
                    discipline_id: string | null
                    event_id: string | null
                    id: string
                    name: string
                    operating_cost: number | null
                    start_time: string | null
                    updated_at: string | null
                }
                Insert: {
                    category: Database["public"]["Enums"]["competition_category"]
                    created_at?: string | null
                    current_phase?: Database["public"]["Enums"]["competition_phase"] | null
                    discipline_id?: string | null
                    event_id?: string | null
                    id?: string
                    name: string
                    operating_cost?: number | null
                    start_time?: string | null
                    updated_at?: string | null
                }
                Update: {
                    category?: Database["public"]["Enums"]["competition_category"]
                    created_at?: string | null
                    current_phase?: Database["public"]["Enums"]["competition_phase"] | null
                    discipline_id?: string | null
                    event_id?: string | null
                    id?: string
                    name?: string
                    operating_cost?: number | null
                    start_time?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "competitions_discipline_id_fkey"
                        columns: ["discipline_id"]
                        isOneToOne: false
                        referencedRelation: "disciplines"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "competitions_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            crystallized_competition_results: {
                Row: {
                    id: string
                    event_id: string | null
                    competition_id: string | null
                    event_name: string | null
                    competition_name: string | null
                    results_json: Json | null
                    generated_at: string | null
                }
                Insert: {
                    id?: string
                    event_id?: string | null
                    competition_id?: string | null
                    event_name?: string | null
                    competition_name?: string | null
                    results_json?: Json | null
                    generated_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string | null
                    competition_id?: string | null
                    event_name?: string | null
                    competition_name?: string | null
                    results_json?: Json | null
                    generated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "crystallized_competition_results_competition_id_fkey"
                        columns: ["competition_id"]
                        isOneToOne: false
                        referencedRelation: "competitions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            discipline_parameters: {
                Row: {
                    created_at: string | null
                    discipline_id: string
                    parameter_id: string
                }
                Insert: {
                    created_at?: string | null
                    discipline_id: string
                    parameter_id: string
                }
                Update: {
                    created_at?: string | null
                    discipline_id?: string
                    parameter_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "discipline_parameters_discipline_id_fkey"
                        columns: ["discipline_id"]
                        isOneToOne: false
                        referencedRelation: "disciplines"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "discipline_parameters_parameter_id_fkey"
                        columns: ["parameter_id"]
                        isOneToOne: false
                        referencedRelation: "scoring_parameters"
                        referencedColumns: ["id"]
                    },
                ]
            }
            disciplines: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    scoring_type: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    scoring_type: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    scoring_type?: string
                }
                Relationships: []
            }
            events: {
                Row: {
                    created_at: string | null
                    director_id: string | null
                    end_date: string | null
                    id: string
                    location: string | null
                    name: string
                    start_date: string | null
                    status: Database["public"]["Enums"]["event_status"] | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    director_id?: string | null
                    end_date?: string | null
                    id?: string
                    location?: string | null
                    name: string
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["event_status"] | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    director_id?: string | null
                    end_date?: string | null
                    id?: string
                    location?: string | null
                    name?: string
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["event_status"] | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            judge_event_access: {
                Row: {
                    access_code: string
                    created_at: string | null
                    event_id: string | null
                    id: string
                    judge_id: string | null
                }
                Insert: {
                    access_code: string
                    created_at?: string | null
                    event_id?: string | null
                    id?: string
                    judge_id?: string | null
                }
                Update: {
                    access_code?: string
                    created_at?: string | null
                    event_id?: string | null
                    id?: string
                    judge_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "judge_event_access_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "judge_event_access_judge_id_fkey"
                        columns: ["judge_id"]
                        isOneToOne: false
                        referencedRelation: "judges_registry"
                        referencedColumns: ["id"]
                    },
                ]
            }
            judges_registry: {
                Row: {
                    created_at: string | null
                    first_name: string
                    id: string
                    last_name: string
                }
                Insert: {
                    created_at?: string | null
                    first_name: string
                    id?: string
                    last_name: string
                }
                Update: {
                    created_at?: string | null
                    first_name?: string
                    id?: string
                    last_name?: string
                }
                Relationships: []
            }
            judgments_parameters: {
                Row: {
                    created_at: string | null
                    id: string
                    judge_code: string
                    judge_name: string | null
                    judge_surname: string | null
                    parameter_id: string | null
                    performance_id: string | null
                    round_id: string | null
                    score: number
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    judge_code: string
                    judge_name?: string | null
                    judge_surname?: string | null
                    parameter_id?: string | null
                    performance_id?: string | null
                    round_id?: string | null
                    score: number
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    judge_code?: string
                    judge_name?: string | null
                    judge_surname?: string | null
                    parameter_id?: string | null
                    performance_id?: string | null
                    round_id?: string | null
                    score?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "judgments_parameters_parameter_id_fkey"
                        columns: ["parameter_id"]
                        isOneToOne: false
                        referencedRelation: "scoring_parameters"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "judgments_parameters_performance_id_fkey"
                        columns: ["performance_id"]
                        isOneToOne: false
                        referencedRelation: "performances"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "judgments_parameters_round_id_fkey"
                        columns: ["round_id"]
                        isOneToOne: false
                        referencedRelation: "competition_rounds"
                        referencedColumns: ["id"]
                    },
                ]
            }
            judgments_skating: {
                Row: {
                    created_at: string | null
                    id: string
                    is_cross: boolean | null
                    judge_code: string
                    judge_name: string | null
                    judge_surname: string | null
                    performance_id: string | null
                    rank_position: number | null
                    round_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_cross?: boolean | null
                    judge_code: string
                    judge_name?: string | null
                    judge_surname?: string | null
                    performance_id?: string | null
                    rank_position?: number | null
                    round_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_cross?: boolean | null
                    judge_code?: string
                    judge_name?: string | null
                    judge_surname?: string | null
                    performance_id?: string | null
                    rank_position?: number | null
                    round_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "judgments_skating_performance_id_fkey"
                        columns: ["performance_id"]
                        isOneToOne: false
                        referencedRelation: "performances"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "judgments_skating_round_id_fkey"
                        columns: ["round_id"]
                        isOneToOne: false
                        referencedRelation: "competition_rounds"
                        referencedColumns: ["id"]
                    },
                ]
            }
            performance_members: {
                Row: {
                    athlete_id: string
                    performance_id: string
                }
                Insert: {
                    athlete_id: string
                    performance_id: string
                }
                Update: {
                    athlete_id?: string
                    performance_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "performance_members_athlete_id_fkey"
                        columns: ["athlete_id"]
                        isOneToOne: false
                        referencedRelation: "athletes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "performance_members_performance_id_fkey"
                        columns: ["performance_id"]
                        isOneToOne: false
                        referencedRelation: "performances"
                        referencedColumns: ["id"]
                    },
                ]
            }
            performances: {
                Row: {
                    bib_number: number | null
                    category: Database["public"]["Enums"]["competition_category"] | null
                    competition_id: string | null
                    created_at: string | null
                    id: string
                    name: string
                }
                Insert: {
                    bib_number?: number | null
                    category?: Database["public"]["Enums"]["competition_category"] | null
                    competition_id?: string | null
                    created_at?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    bib_number?: number | null
                    category?: Database["public"]["Enums"]["competition_category"] | null
                    competition_id?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "performances_competition_id_fkey"
                        columns: ["competition_id"]
                        isOneToOne: false
                        referencedRelation: "competitions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    role: Database["public"]["Enums"]["user_role"] | null
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                }
                Relationships: []
            }
            scoring_parameters: {
                Row: {
                    id: string
                    name: string
                }
                Insert: {
                    id?: string
                    name: string
                }
                Update: {
                    id?: string
                    name?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            calculate_skating_results: {
                Args: {
                    p_round_id: string
                }
                Returns: Json
            }
            calculate_parameter_results: {
                Args: {
                    p_round_id: string
                }
                Returns: Json
            }
            close_competition_and_crystallize: {
                Args: {
                    p_competition_id: string
                }
                Returns: Json
            }
            create_performance_with_members: {
                Args: {
                    p_competition_id: string
                    p_name: string
                    p_bib_number: number
                    p_category: Database["public"]["Enums"]["competition_category"]
                    p_athlete_ids: string[]
                }
                Returns: string
            }
            submit_batch_judgments_skating: {
                Args: {
                    p_round_id: string
                    p_judge_code: string
                    p_judge_name: string
                    p_judge_surname: string
                    p_performance_ids: string[]
                }
                Returns: undefined
            }
            submit_batch_rankings_skating: {
                Args: {
                    p_round_id: string
                    p_judge_code: string
                    p_judge_name: string
                    p_judge_surname: string
                    p_rankings: Json
                }
                Returns: undefined
            }
            submit_performance_parameter_scores: {
                Args: {
                    p_round_id: string
                    p_performance_id: string
                    p_judge_code: string
                    p_judge_name: string
                    p_judge_surname: string
                    p_scores: Json
                }
                Returns: undefined
            }
        }
        Enums: {
            competition_category: "solo" | "duo" | "couple" | "group"
            competition_phase: "registration" | "heats" | "semifinal" | "final" | "completed"
            event_status: "planned" | "active" | "finished"
            round_type: "eliminatory" | "final"
            user_role: "admin" | "director" | "judge"
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
