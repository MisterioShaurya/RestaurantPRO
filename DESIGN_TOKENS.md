# COLOR PALETTE & DESIGN TOKENS

## Official Colors

### Primary Green (Fresh, Success)
```
Name: Fresh Green
Hex: #22c55e
RGB: rgb(34, 197, 94)
HSL: hsl(132, 78%, 45%)

Usage:
- Primary buttons
- Success states
- Active indicators
- Healthy metrics
```

### Secondary Orange (Warm, Action)
```
Name: Warm Orange  
Hex: #f97316
RGB: rgb(249, 115, 22)
HSL: hsl(25, 97%, 53%)

Usage:
- Secondary buttons
- Action prompts
- Preparing states
- Highlights
```

### Alert Red (Urgent, Danger)
```
Name: Tomato Red
Hex: #ef4444
RGB: rgb(239, 68, 68)
HSL: hsl(0, 84%, 60%)

Usage:
- Delete/danger actions
- Urgent/pending orders
- Error messages
- Alerts
```

### Warning Yellow (Attention)
```
Name: Mustard Yellow
Hex: #eab308
RGB: rgb(234, 179, 8)
HSL: hsl(46, 93%, 47%)

Usage:
- Warnings
- On-hold status
- Highlights
```

### Background (Cream)
```
Name: Off-white Cream
Hex: #faf8f3
RGB: rgb(250, 248, 243)
HSL: hsl(30, 67%, 98%)

Usage:
- Main page background
- Gradient bases
- Large areas
```

### Surface (White)
```
Name: Pure White
Hex: #ffffff
RGB: rgb(255, 255, 255)
HSL: hsl(0, 0%, 100%)

Usage:
- Cards
- Modals
- Input fields
- Surfaces
```

### Text Primary (Dark)
```
Name: Dark Text
Hex: #1f2937
RGB: rgb(31, 41, 55)
HSL: hsl(217, 28%, 17%)

Usage:
- Headings
- Primary text
- High contrast
```

### Text Secondary (Medium)
```
Name: Medium Gray
Hex: #6b7280
RGB: rgb(107, 114, 128)
HSL: hsl(215, 12%, 47%)

Usage:
- Secondary text
- Descriptions
- Muted content
```

### Borders (Light)
```
Name: Light Gray
Hex: #e5e7eb
RGB: rgb(229, 231, 235)
HSL: hsl(210, 21%, 91%)

Usage:
- Card borders
- Dividers
- Input borders
```

---

## Tailwind Color Mapping

### Greens
```
green-50:   #f0fdf4  (very light)
green-100:  #dcfce7
green-500:  #22c55e  (primary)
green-600:  #16a34a
green-700:  #15803d
```

### Oranges
```
orange-50:  #fff7ed  (very light)
orange-100: #feed7d
orange-500: #f97316  (secondary)
orange-600: #ea580c
orange-700: #c2410c
```

### Reds
```
red-50:     #fef2f2  (very light)
red-100:    #fee2e2
red-500:    #ef4444  (danger)
red-600:    #dc2626
red-700:    #b91c1c
```

### Yellows
```
yellow-50:  #fefce8  (very light)
yellow-100: #fef08a
yellow-400: #facc15  (standard)
yellow-500: #eab308  (mustard)
```

### Grays
```
gray-50:    #f9fafb  (very light)
gray-100:   #f3f4f6
gray-200:   #e5e7eb  (borders)
gray-600:   #4b5563  (secondary text)
gray-700:   #374151  (primary text)
gray-900:   #111827
```

---

## Shadows

### Light Shadows
```css
card-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 
              0 1px 3px rgba(0, 0, 0, 0.04);
}

card-shadow-hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 
              0 4px 8px rgba(0, 0, 0, 0.06);
}
```

### Apply in HTML
```html
<div class="card-shadow hover:card-shadow-hover">Card</div>
```

---

## Border Radius

```
Type: Rounded  
Corners: Friendly, modern

rounded-lg:    0.5rem (8px) - small elements
rounded-xl:    0.75rem (12px) - buttons, inputs
rounded-2xl:   1rem (16px) - cards, containers
rounded-3xl:   1.5rem (24px) - large containers
```

---

## Animations

### Pop (Button Press)
```css
@keyframes pop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-pop {
  animation: pop 0.3s ease-in-out;
}
```

**When to use**: Button clicks, alerts, confirmations

---

### Slide Up (Page Load)
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}
```

**When to use**: Page sections, card loads, list items

---

### Float (Hover)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

**When to use**: Call-to-action cards, important elements

---

### Pulse Highlight (Attention)
```css
@keyframes pulse-highlight {
  0%, 100% { background-color: rgba(34, 197, 94, 0); }
  50% { background-color: rgba(34, 197, 94, 0.1); }
}

.animate-pulse-highlight {
  animation: pulse-highlight 1s ease-in-out;
}
```

**When to use**: New order alerts, important updates

---

## Typography Scale

```
H1: text-5xl font-bold (48px, bold)
H2: text-3xl font-bold (30px, bold)
H3: text-2xl font-bold (24px, bold)
Body: text-base (16px, normal)
Small: text-sm (14px, normal)
Tiny: text-xs (12px, normal)
```

---

## Spacing Scale

```
Gap/Margin: 
  - gap-4: 1rem (16px)
  - gap-5: 1.25rem (20px)
  - gap-6: 1.5rem (24px)
  - gap-8: 2rem (32px)

Padding:
  - p-4: 1rem (16px)
  - p-6: 1.5rem (24px)
  - p-8: 2rem (32px)
```

---

## Button Styles

### Primary Button
```html
<button class="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95">
  Action
</button>
```

### Secondary Button
```html
<button class="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-4 py-3 transition-all shadow-sm hover:shadow-md active:scale-95">
  Action
</button>
```

### Danger Button
```html
<button class="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-4 py-2 shadow-sm hover:shadow-md active:scale-95">
  Delete
</button>
```

### Outline Button
```html
<button class="border-2 border-gray-300 bg-white text-gray-900 font-semibold rounded-xl px-4 py-2 hover:bg-gray-50 active:bg-gray-100">
  Cancel
</button>
```

---

## Card Styles

### Standard Card
```html
<div class="bg-white rounded-2xl border border-gray-200 p-6 card-shadow hover:card-shadow-hover transition-all">
  Content
</div>
```

### Status Card (with top border)
```html
<div class="border-l-4 border-green-500 bg-green-50 rounded-2xl p-6">
  Content
</div>
```

---

## Form Elements

### Input Field
```html
<input type="text" class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all" />
```

### Textarea
```html
<textarea class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all"></textarea>
```

---

## Status Badges

### Success
```html
<span class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 font-semibold rounded-full text-xs">
  ✓ Completed
</span>
```

### Warning
```html
<span class="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 font-semibold rounded-full text-xs">
  ⚠ Pending
</span>
```

### Danger
```html
<span class="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 font-semibold rounded-full text-xs">
  ✕ Failed
</span>
```

---

## Responsive Design

```html
<!-- Mobile first approach -->

<!-- Small screens (default) -->
<div class="text-base p-4">Mobile</div>

<!-- Medium screens (768px+) -->
<div class="md:text-lg md:p-6">Tablet</div>

<!-- Large screens (1024px+) -->  
<div class="lg:text-xl lg:p-8">Desktop</div>

<!-- Column on mobile, grid on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Cards...
</div>
```

---

## Quick Copy-Paste Examples

### Hero Section
```html
<div class="bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50 p-8">
  <h1 class="text-5xl font-bold text-gray-900 mb-2">Title</h1>
  <p class="text-lg text-gray-600">Description</p>
</div>
```

### Stat Cards
```html
<div class="bg-white rounded-2xl p-6 card-shadow">
  <div class="bg-green-50 rounded-xl p-3 w-fit mb-4">
    <div class="text-3xl">📊</div>
  </div>
  <p class="text-sm text-gray-600 uppercase font-semibold">Label</p>
  <p class="text-3xl font-bold text-gray-900 mt-2">42</p>
</div>
```

### Action Card
```html
<button class="group relative bg-white rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all hover:translate-y-[-4px]">
  <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">🔥</div>
  <p class="font-bold text-lg text-gray-900 mb-1">Title</p>
  <p class="text-sm text-gray-600">Description</p>
</button>
```

---

## CSS Custom Properties

```css
:root {
  --color-fresh-green: #22c55e;
  --color-warm-orange: #f97316;
  --color-tomato-red: #ef4444;
  --color-mustard-yellow: #eab308;
  --color-cream-bg: #faf8f3;
  --color-light-text: #1f2937;
}

/* Usage */
.my-element {
  color: var(--color-light-text);
  background-color: var(--color-cream-bg);
}
```

---

## Design Checklist

- [ ] Colors follow palette
- [ ] Rounded corners at 12px+ 
- [ ] Shadows use card-shadow classes
- [ ] Animations smooth (200-400ms)
- [ ] Text contrast ≥ 4.5:1
- [ ] Touch targets ≥ 44px
- [ ] Responsive grid layout
- [ ] Food emojis for icons
- [ ] Green for success states
- [ ] Red for errors/dangers

---

*Design System Version: 1.0*
*Last Updated: March 19, 2026*
