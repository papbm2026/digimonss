import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: {
      // PERBAIKAN UTAMA: Mendefinisikan 'process.env' sebagai objek kosong 
      // agar library yang mencoba mengakses process.env tidak menyebabkan crash (Blank Screen)
      'process.env': {},
      
      // Meneruskan variabel spesifik jika dibutuhkan oleh library pihak ketiga
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
    },
    resolve: {
      alias: {
        // Mengarahkan '@' ke folder 'src'. 
        // Pastikan folder 'src' Anda ada, jika tidak, ganti ke '.'
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Menghindari masalah saat deploy ke Vercel jika ada error linting kecil
      chunkSizeWarningLimit: 1600,
    },
  };
});
