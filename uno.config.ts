import { defineConfig, presetAttributify, presetIcons, presetTypography, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons(), presetTypography()],
  shortcuts: {
    'page-center': 'min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6'
  },
  theme: {
    colors: {
      border: 'hsl(214 32% 91%)',
      input: 'hsl(214 32% 91%)',
      ring: 'hsl(222.2 84% 4.9%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      primary: {
        DEFAULT: 'hsl(222.2 47.4% 11.2%)',
        foreground: 'hsl(210 40% 98%)'
      },
      secondary: {
        DEFAULT: 'hsl(210 40% 96.1%)',
        foreground: 'hsl(222.2 47.4% 11.2%)'
      },
      destructive: {
        DEFAULT: 'hsl(0 84.2% 60.2%)',
        foreground: 'hsl(210 40% 98%)'
      },
      muted: {
        DEFAULT: 'hsl(210 40% 96.1%)',
        foreground: 'hsl(215.4 16.3% 46.9%)'
      },
      accent: {
        DEFAULT: 'hsl(210 40% 96.1%)',
        foreground: 'hsl(222.2 47.4% 11.2%)'
      }
    },
    borderRadius: {
      lg: '0.5rem',
      md: 'calc(0.5rem - 2px)',
      sm: 'calc(0.5rem - 4px)'
    }
  }
});
