import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Client-side Supabase instance (anon key, safe for browser)
 */
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (null as any);

/**
 * Server-side Supabase instance (service role key, full permissions)
 * Use this only on the server for admin operations
 */
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : (null as any);

/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  displayName?: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  lemonSqueezyOrderId?: string;
  email?: string;
  status: "active" | "cancelled" | "paused" | "pending";
  planName?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  id: string;
  userId: string;
  title?: string;
  content: string;
  personas?: string[];
  mood?: string;
  debate?: Record<string, unknown>;
  tools?: Record<string, unknown>;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User operations
 */
export const userOps = {
  /**
   * Create or get user by email
   */
  async getOrCreateUser(email: string, displayName?: string): Promise<User | null> {
    // First try to get existing user
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) return existing;

    // Create new user
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        email,
        displayName: displayName || email.split("@")[0],
        isPremium: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return null;
    }

    return newUser;
  },

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    const { data } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return data || null;
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    return data || null;
  },

  /**
   * Update user premium status
   */
  async setPremium(userId: string, isPremium: boolean): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ isPremium, updatedAt: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user premium status:", error);
      return null;
    }

    return data;
  },

  /**
   * Update user email premium status by email
   */
  async setPremiumByEmail(email: string, isPremium: boolean): Promise<User | null> {
    const user = await userOps.getUserByEmail(email);
    if (!user) return null;
    return userOps.setPremium(user.id, isPremium);
  },
};

/**
 * Subscription operations
 */
export const subscriptionOps = {
  /**
   * Create subscription from LemonSqueezy order
   */
  async createFromLemonSqueezy(
    email: string,
    lemonSqueezyOrderId: string,
    planName: string = "Premium"
  ): Promise<Subscription | null> {
    // Get or create user
    const user = await userOps.getOrCreateUser(email);
    if (!user) return null;

    // Create subscription
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        userId: user.id,
        email,
        lemonSqueezyOrderId,
        status: "active",
        planName,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      return null;
    }

    // Update user premium status
    await userOps.setPremium(user.id, true);

    return data;
  },

  /**
   * Get user subscriptions
   */
  async getByUser(userId: string): Promise<Subscription[]> {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    return data || [];
  },

  /**
   * Get active subscription
   */
  async getActiveByUser(userId: string): Promise<Subscription | null> {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("userId", userId)
      .eq("status", "active")
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },
};

/**
 * Result operations
 */
export const resultOps = {
  /**
   * Save Trinity result
   */
  async save(
    userId: string,
    content: string,
    metadata?: {
      title?: string;
      personas?: string[];
      mood?: string;
      debate?: Record<string, unknown>;
      tools?: Record<string, unknown>;
    }
  ): Promise<Result | null> {
    const { data, error } = await supabaseAdmin
      .from("results")
      .insert({
        userId,
        content,
        title: metadata?.title,
        personas: metadata?.personas,
        mood: metadata?.mood,
        debate: metadata?.debate,
        tools: metadata?.tools,
        isPinned: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving result:", error);
      return null;
    }

    return data;
  },

  /**
   * Get user results
   */
  async getByUser(userId: string, limit: number = 50): Promise<Result[]> {
    const { data } = await supabaseAdmin
      .from("results")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(limit);
    return data || [];
  },

  /**
   * Delete result
   */
  async delete(resultId: string, userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from("results")
      .delete()
      .eq("id", resultId)
      .eq("userId", userId);

    if (error) {
      console.error("Error deleting result:", error);
      return false;
    }

    return true;
  },

  /**
   * Toggle pin
   */
  async togglePin(resultId: string, userId: string): Promise<Result | null> {
    // Get current state
    const { data: current } = await supabaseAdmin
      .from("results")
      .select("isPinned")
      .eq("id", resultId)
      .eq("userId", userId)
      .single();

    if (!current) return null;

    // Toggle
    const { data } = await supabaseAdmin
      .from("results")
      .update({ isPinned: !current.isPinned })
      .eq("id", resultId)
      .select()
      .single();

    return data || null;
  },
};
