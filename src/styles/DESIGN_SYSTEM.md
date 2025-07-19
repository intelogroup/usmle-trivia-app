# USMLE Trivia - Glassmorphism Design System

## 🎨 Design Philosophy

Our design system is built around **dark theme glassmorphism** with **minimalistic principles**, creating a modern, elegant, and functional interface for medical education.

### Core Principles

1. **Glassmorphism First**: Frosted glass effects with subtle transparency and backdrop blur
2. **Minimalistic Aesthetics**: Clean, uncluttered interfaces with purposeful use of space
3. **Depth Through Layering**: Multiple levels of glass effects creating visual hierarchy
4. **Subtle Interactions**: Smooth animations and micro-interactions for enhanced UX

## 🪟 Glassmorphism Components

### CSS Classes Available

#### Base Glass Effects

- `.glass` - Basic glassmorphism with light transparency
- `.glass-dark` - Dark theme optimized glass effect
- `.glass-subtle` - Lighter, more transparent effect
- `.glass-subtle-dark` - Dark theme subtle glass
- `.glass-strong` - More opaque glass for important elements
- `.glass-strong-dark` - Dark theme strong glass

#### Card Variants

- `.glass-card` - Perfect for content cards and panels
- `.glass-card-dark` - Dark theme card variant
- `.glass-morphism` - Utility class for custom glassmorphism
- `.glass-morphism-dark` - Dark theme utility

#### Interactive Elements

- `.glass-button` - Interactive buttons with glass effect
- `.glass-button-dark` - Dark theme button variant
- `.glass-input` - Input fields with glassmorphism
- `.glass-input-dark` - Dark theme input variant

#### Navigation

- `.glass-nav` - Navigation bars with enhanced blur
- `.glass-nav-dark` - Dark theme navigation

#### Overlays

- `.glass-overlay` - Modal and overlay backgrounds
- `.glass-overlay-light` - Light theme overlay variant

#### Gradients

- `.glass-gradient-primary` - Primary color gradient glass
- `.glass-gradient-success` - Success state gradient glass
- `.glass-gradient-warning` - Warning state gradient glass
- `.glass-gradient-danger` - Danger state gradient glass

## 🎯 Usage Guidelines

### 1. Layering

Create depth by layering different glass effects:

```jsx
<div className="glass-card dark:glass-card-dark">
  <div className="glass-subtle dark:glass-subtle-dark">Content here</div>
</div>
```

### 2. Spacing (Minimalistic)

Use consistent spacing patterns:

- `.minimal-spacing` (1rem) - Default spacing
- `.minimal-spacing-sm` (0.75rem) - Compact elements
- `.minimal-spacing-lg` (1.5rem) - Spacious layouts
- `.minimal-spacing-xl` (2rem) - Hero sections

### 3. Color Palette

Prefer glassmorphism over solid colors:

- Use glass effects with color tints instead of solid backgrounds
- Maintain transparency for depth perception
- Leverage gradient overlays for visual interest

### 4. Typography

Enhance readability with glass backgrounds:

- Use `.text-shadow` for text on glass surfaces
- Maintain sufficient contrast
- Prefer semi-bold fonts on glass surfaces

## 🧩 React Components

### GlassCard

```jsx
import GlassCard from "./components/ui/GlassCard";

<GlassCard
  variant="default|subtle|strong|gradient"
  padding="sm|default|lg|xl"
  hover={true}
  animated={true}
>
  Content
</GlassCard>;
```

### GlassButton

```jsx
import GlassButton from "./components/ui/GlassButton";

<GlassButton
  variant="default|primary|success|warning|danger"
  size="sm|default|lg|xl"
  loading={false}
  disabled={false}
  icon={<IconComponent />}
>
  Button Text
</GlassButton>;
```

### GlassInput

```jsx
import GlassInput from "./components/ui/GlassInput";

<GlassInput
  label="Input Label"
  error="Error message"
  icon={<IconComponent />}
  placeholder="Placeholder text"
/>;
```

## 🌈 Background Patterns

### Glassmorphism Background

Our layout includes animated glassmorphism background patterns:

```jsx
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl animate-pulse-slow" />
  <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-200/20 via-cyan-200/20 to-teal-200/20 dark:from-indigo-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 rounded-full blur-3xl animate-float" />
</div>
```

## 🎭 Animation Guidelines

### Glassmorphism Animations

- Use `scale` transforms for hover effects (1.02 max)
- Implement smooth `backdrop-blur` transitions
- Leverage `opacity` changes for state transitions
- Apply gentle `y` translations for depth

### Recommended Transitions

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## 📱 Responsive Considerations

### Mobile Optimizations

- Reduce blur intensity on mobile devices for performance
- Increase touch targets (min 44px)
- Use lighter glass effects to preserve battery
- Implement proper safe area handling

### Performance

- Use `transform: translateZ(0)` for hardware acceleration
- Apply `will-change: transform` sparingly
- Optimize backdrop-filter usage
- Reduce motion for `prefers-reduced-motion`

## 🎨 Design Tokens

### Blur Values

- `blur(8px)` - Subtle overlay effects
- `blur(12px)` - Default glass effect
- `blur(16px)` - Standard card blur
- `blur(20px)` - Navigation and headers
- `blur(24px)` - Strong emphasis elements

### Opacity Values

- `0.1` - Subtle background tints
- `0.25` - Light glass effects
- `0.4` - Default glass opacity
- `0.6` - Input fields and interactive elements
- `0.85` - Strong glass components

### Border Opacity

- `rgba(255, 255, 255, 0.05)` - Subtle dark theme borders
- `rgba(255, 255, 255, 0.1)` - Default dark theme borders
- `rgba(255, 255, 255, 0.18)` - Light theme borders
- `rgba(255, 255, 255, 0.3)` - Prominent borders

## 🌗 Dark Mode Consistency

### Automatic Switching

All glassmorphism components automatically adapt to dark mode using Tailwind's `dark:` prefix:

```jsx
className = "glass-card dark:glass-card-dark";
```

### Color Adaptation

- Light mode: White-based glass with subtle shadows
- Dark mode: Dark slate-based glass with enhanced borders
- Consistent contrast ratios maintained across themes

## ✨ Best Practices

### DO

- Layer glass effects for depth
- Use consistent blur values
- Maintain proper contrast
- Implement smooth transitions
- Optimize for performance

### DON'T

- Overuse strong glass effects
- Mix solid colors with glassmorphism inconsistently
- Use excessive blur that impacts readability
- Ignore performance implications
- Forget dark mode variants

## 🎯 Component Examples

### Medical Category Card

```jsx
<GlassCard className="hover:scale-[1.02] transition-all duration-300">
  <div className="glass-subtle dark:glass-subtle-dark p-3 rounded-xl">
    <HeartIcon />
  </div>
  <h3>Cardiology</h3>
  <p>Heart and cardiovascular system</p>
</GlassCard>
```

### Quiz Question Card

```jsx
<GlassCard variant="strong" padding="lg">
  <h2>Question 1 of 10</h2>
  <p>What is the most common cause of...?</p>
  <div className="space-y-2">
    {options.map((option) => (
      <GlassButton variant="default" key={option.id}>
        {option.text}
      </GlassButton>
    ))}
  </div>
</GlassCard>
```

This design system ensures consistency across the entire application while maintaining the modern, medical-professional aesthetic that users expect from a USMLE preparation tool.
