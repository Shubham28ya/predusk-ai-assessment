# Predusk Ai

This is a polished, frontend-only prototype of an AI interface built for the Frontend & UI/UX Designer Assessment.

## Research

**Platforms Reviewed:**
1. **OpenAI Playground**: Known for its comprehensive parameter controls (Temperature, Top P) and clean, developer-focused interface.
2. **Anthropic Claude UI**: Praised for its conversational flow and elegant, minimalist typography.
3. **Hugging Face Spaces**: Stands out for its community-driven models and raw, customizable gradio/streamlit interfaces.
4. **Vercel AI SDK Playground**: Offers an incredibly snappy, edge-ready chat interface with seamless model switching.

**Chosen Features for Prototype:**
1. **Model Selector Dropdown**: Quickly switch between mock AI models.
2. **Prompt Editor with Template Load**: Text area with a dropdown to quickly load predefined JSON templates.
3. **Parameters Panel**: Fine-tune controls with sliders for `Temperature` and `Max Tokens`.
4. **Chat/Output Area**: Clean conversation UI with "Copy" and "Download JSON" hover actions.
5. **Theme Toggle**: Accessible switch to change from Light to Dark mode.
6. **Responsive Split-Pane Layout**: A sidebar for configuration and a main area for chat, collapsing neatly on mobile.

## Design

The design language uses a highly polished, minimalist approach inspired by modern devtools (like Vercel and Linear).
** Figma Link :**
https://www.figma.com/proto/PK2lYwVYx4MBTiNzfuRbJ6/Untitled?node-id=5-1753&p=f&t=WNS6fm8REA5GdN5c-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=5%3A1753&show-proto-sidebar=1

**Tailwind Mapping:**
- **Colors**:
  - Light mode uses crisp whites (`bg-white`) with subtle gray borders (`border-zinc-200`).
  - Dark mode maps to deep Slate/Zinc tones (`#09090b` for background, `#18181b` for primary elements).
  - Primary accents use high-contrast foregrounds for maximum legibility.
- **Typography**: Uses the `Geist` font family (Next.js default) mapped to `--font-sans` for a highly legible, modern sans-serif look.
- **Spacing**: Standard Tailwind scales (`p-4`, `space-y-6`) create a breathable, rhythmic layout.
- **Animations**: `framer-motion` is used to provide buttery-smooth layout transitions, such as the chat bubbles sliding up (`initial={{ opacity: 0, y: 10 }}`).

## Development

**Tech Stack:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS v4, Framer Motion, Next-Themes, Storybook.

**Key Implementation Details:**
- **Mock API**: Served via Next.js Route Handlers (`/api/models` and `/api/templates`).
- **groq API**: for better and realistic output i used the groq api which will expire on 26/6/2026.
- **State Management**: React Context (`AppContext`) is used to centrally manage the selected session state (messages, parameters, models) to decouple it from the UI layout.
- **Storybook Note**: Storybook v8 initialization was performed, and stories are present in the component library. However, due to Next.js 15 and Node.js v22 environment changes, the `npm run storybook` runner might experience module resolution issues (specifically with `next/config`). The components themselves are fully operational in the Next.js app.

## Running the Project

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Run the storybook
npm run storybook
```



Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
