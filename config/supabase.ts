import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string; // Используем имя из .env
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string; // Используем имя из .env

// --- TEMPORARY DEBUG ---
console.log("--- DEBUG: Reading Supabase URL:", supabaseUrl);
// Выведем только первые и последние 10 символов ключа для сверки (безопаснее)
console.log("--- DEBUG: Reading Supabase Key (start):", supabaseKey?.substring(0, 10));
console.log("--- DEBUG: Reading Supabase Key (end):", supabaseKey?.slice(-10));
// Добавим проверку на пустые значения на всякий случай
if (!supabaseUrl || !supabaseKey) {
   console.error(">>> FATAL DEBUG: Supabase URL or Anon Key is NULL or EMPTY after reading from process.env!");
}
// --- END DEBUG ---

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

AppState.addEventListener("change", (state) => {
    if (state === "active") {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});
