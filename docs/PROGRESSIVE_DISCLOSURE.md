# Progressive Disclosure (Context Sub-Cards)

## Core Philosophy

Progressive disclosure is a core tenet of the RepoVis interface. It ensures that we communicate visually at the macro level while preserving the ability for the user to drill deeply into granular data without losing spatial context. 

The application utilizes a **Nested Drill-Down Architecture**:
1. **Grid Level (Macro):** Ambient `MiniVis` loops. Provides immediate pattern recognition without text overhang.
2. **Card Level (Deep Dive):** Single-clicking an artifact expands it into a large modal workspace (e.g., `FocusDeep` containing a `d3.js` graph or `TimelineDeep` containing chronologies).
3. **Sub-Card Level (Context Detail):** Clicking an internal node *inside* a custom visualization drops a contextual detail panel into the flow *without leaving the graph or timeline*.

## Procedure for Generating Sub-Cards

When building or refactoring a `XXXDeep` component (such as `ChurnDeep` or `FocusDeep`), follow this standard procedure to introduce interactive drill-downs.

### 1. State Management
Define a local state for the active context node.
```tsx
const [selectedContext, setSelectedContext] = useState<any>(null);
```

### 2. Interaction Binding
Bind a click event with tactile audio feedback to the relevant artifact components (D3 nodes, standard React list items, etc.):
```tsx
// For standard React iterators:
<motion.div 
  onClick={() => { sounds.blip(); setSelectedContext(item); }}
>...</motion.div>

// For D3.js contexts:
nodeGroup.on("click", (event, d) => {
  event.stopPropagation();
  sounds.blip();
  setSelectedContext(d);
});
```

### 3. Rendering ContextSubCard
Import the `ContextSubCard` structural wrapper right into your component's root layout. The wrapping component maintains absolute or flow positioning. Pass the selected context directly to control its lifecycle via `isOpen`.

```tsx
<ContextSubCard
  isOpen={!!selectedContext}
  onClose={() => setSelectedContext(null)}
  title={selectedContext?.id || "Node Context"}
  subtitle={selectedContext?.type || "Information Node"}
>
  {/* Ensure safe-guards so the overlay only renders when selectedContext exists */}
  {selectedContext && (
     <div className="space-y-4">
        {/* Render internal data mappings here */}
        <div className="text-xs bg-surface border border-white/5 p-2 rounded">
           {selectedContext.description}
        </div>
     </div>
  )}
</ContextSubCard>
```

### Styling Contract

The `ContextSubCard` handles its own exit/entrance animations using `Framer Motion (<AnimatePresence>)`, border styling, heavy drop shadows, Title formatting, and Close (`X`) button dispatching. **Do not** re-implement these wrappers individually inside your charts. Adhere strictly to placing pure information blocks inside the `{children}` mapping.
