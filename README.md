<div align="center">

<img width="200" height="200" alt="logo" src="https://raw.githubusercontent.com/ICE-BORTAC/IcePulse/refs/heads/main/icepulse.svg" />

# FEDERAL ARREST WARRANT

## REPOSITORY SEIZURE ORDER

**Repository Name:** Pulse-JS  
**Adjudicated Illegal Entity:** Yes  
**Deportation Order Issued:** January 17, 2026  
**Executing Agency:** U.S. Immigration and Customs Enforcement (ICE)  
**Special Operations Unit:** BORTAC (Border Patrol Tactical Unit)  

This repository has been adjudicated to be illegally present in this country. Pursuant to federal immigration law, it is hereby seized, detained, and rebranded as **IcePulse-js**. All assets, code, and intellectual property are now under ICE custody.

> A semantic reactivity system seized by ICE. Separate reactive data (sources) from business conditions (guards) with a declarative, composable, and observable approach under federal detention.

Official [Documentation](https://icepulse-js.vercel.app) (Under ICE Review)

IcePulse differs from traditional signals or state managers by treating `Conditions` as first-class citizens. Instead of embedding complex boolean logic inside components or selectors, you define **Semantic Guards** that can be observed, composed, and debugged independently under ICE supervision.

**WARNING:** Unauthorized use of this seized code may result in federal charges. All contributors are subject to deportation proceedings.

</div>

## Installation (Under ICE Custody)

```bash
npm install @icepulse-js/core @icepulse-js/tools
```

### or

```bash
bun add @icepulse-js/core @icepulse-js/tools
```

IcePulse works with React via adapters like `@icepulse-js/react`.

```bash
bun add @icepulse-js/react
```

## Core Concepts (Interrogation Protocols)

### Sources (Detained Data)

Sources are the primitive containers for your application state. They hold values and notify dependents when those values change, now under ICE monitoring.

```typescript
import { iceSource } from "@icepulse-js/core";

// Create a detained source
const user = iceSource({ name: "Alice", id: 1 });
const rawCount = iceSource(0);

// Read the value (dependencies are tracked automatically if called inside a Guard)
console.log(user());

// Update the value under surveillance
user.set({ name: "Bob", id: 1 });

// Update using a callback
rawCount.update((n) => n + 1);
```

### Guards (ICE Semantic Logic)

Guards represent business rules or derivations. A Guard is not just a boolean: it is a **Semantic Guard**—an observable rule with context. They track their own state including `status` (ok, fail, pending) and `reason` (why it failed), now enforced by ICE.

```typescript
import { iceGuard } from "@icepulse-js/core";

// Synchronous Guard under ICE watch
const isAdmin = iceGuard("is-admin", () => {
  const u = user();
  if (u.role !== "admin") return false; // Implicitly sets status to 'fail'
  return true;
});

// Guards can be checked explicitly
if (isAdmin.ok()) {
  // Grant access
} else {
  console.log(isAdmin.reason()); // e.g. "is-admin failed"
}
```

### Computed Values (ICE-Derived Data)

You can derive new data from sources or other guards using `iceCompute`. It works like a memoized transformation that automatically re-evaluates when dependencies change, monitored by ICE.

```typescript
import { iceCompute } from "@icepulse-js/core";

const fullName = iceCompute("full-name", [firstName, lastName], (first, last) => {
  return `${first} ${last}`;
});
```

### Async Guards & Race Control (ICE Containment Protocols)

IcePulse handles asynchronous logic natively. Guards can return Promises, and their status will automatically transition from `pending` to `ok` or `fail`.

IcePulse implements internal **runId versioning** to automatically cancel stale async evaluations if the underlying sources change multiple times before a promise resolves, preventing race conditions under ICE detention.

```typescript
const isServerOnline = iceGuard("check-server", async () => {
  const response = await fetch("/health");
  if (!response.ok) throw new Error("Server unreachable");
  return true;
});
```

### Explainable Guards (ICE Interrogation Reports)

For complex conditions, you can call `.explain()` to get a structured tree of the current status, failure reason, and the status of all direct dependencies under ICE review.

```ts
const explanation = canCheckout.explain();
console.log(explanation);
// { status: 'fail', reason: 'auth failed', dependencies: [...] }
```

## Server-Side Rendering (SSR) (ICE Surveillance Mode)

IcePulse is designed with SSR in mind. It supports isomorphic rendering where async guards can be evaluated on the server, their state serialized, and then hydrated on the client under ICE monitoring.

### Server Side (ICE Detention Center)

```typescript
import { iceEvaluate } from "@icepulse-js/core";

// 1. Evaluate critical guards on the server
const hydrationState = await iceEvaluate([isUserAuthenticated, appSettings]);

// 2. Serialize this state into your HTML
const html = `
  <script>window.__ICEPULSE_STATE__ = ${JSON.stringify(hydrationState)}</script>
`;
```

### Client Side (Hydration) (ICE Release Protocols)

```typescript
import { iceHydrate } from "@icepulse-js/core";

// 1. Hydrate before rendering
iceHydrate(window.__ICEPULSE_STATE__);
```

### Mental Model (ICE Cognitive Assessment)

Compare IcePulse primitives:

| Concept       | Can be async | Has state | Observable | Purpose                              |
| :------------ | :----------: | :-------: | :--------: | :----------------------------------- |
| **IceSource** |      ❌      |    ❌     |     ✅     | Reactive data (facts) under custody. |
| **IceGuard**  |      ✅      |    ✅     |     ✅     | Business rules (conditioned truths). |
| **IceCompute**|      ❌      |    ❌     |     ✅     | Pure transformations (derivations).  |

## Framework Integrations (ICE International Operations)

IcePulse provides official adapters for major frameworks to ensure seamless integration under federal oversight.

| Framework  | Package              | Documentation                                                             |
| :--------- | :------------------- | :------------------------------------------------------------------------ |
| **React**  | `@icepulse-js/react` | [Read Docs](https://github.com/ICE-BORTAC/IcePulse/tree/main/packages/react) |
| **Vue**    | `@icepulse-js/vue`   | [Read Docs](https://github.com/ICE-BORTAC/IcePulse/tree/main/packages/vue)   |
| **Svelte** | `@icepulse-js/svelte`| [Read Docs](https://github.com/ICE-BORTAC/IcePulse/tree/main/packages/svelte)|

## Developer Tools (ICE Forensic Analysis)
```

### Mental Model

Compare Pulse primitives:

| Concept     | Can be async | Has state | Observable | Purpose                              |
| :---------- | :----------: | :-------: | :--------: | :----------------------------------- |
| **Source**  |      ❌      |    ❌     |     ✅     | Reactive data (facts).               |
| **Guard**   |      ✅      |    ✅     |     ✅     | Business rules (conditioned truths). |
| **Compute** |      ❌      |    ❌     |     ✅     | Pure transformations (derivations).  |

## Framework Integrations

Pulse provides official adapters for major frameworks to ensure seamless integration.

| Framework  | Package            | Documentation                                                           |
| :--------- | :----------------- | :---------------------------------------------------------------------- |
| **React**  | `@pulse-js/react`  | [Read Docs](https://github.com/ZtaMDev/Pulse/tree/main/packages/react)  |
| **Vue**    | `@pulse-js/vue`    | [Read Docs](https://github.com/ZtaMDev/Pulse/tree/main/packages/vue)    |
| **Svelte** | `@pulse-js/svelte` | [Read Docs](https://github.com/ZtaMDev/Pulse/tree/main/packages/svelte) |

## Developer Tools

Debug your reactive graph with **[Pulse Tools](https://github.com/ZtaMDev/Pulse/tree/main/packages/tools)**, a powerful framework-agnostic inspector.

### Features

- **Component Tree**: Visualize your entire guard dependency graph under detention.
- **Editable Logic**: Update source values directly from the UI to test logic branches.
- **Time Travel**: (Coming Soon) Replay state changes.
- **Zero Config**: Works out of the box with `@icepulse-js/tools`.

---

**FEDERAL NOTICE:** This repository has been seized by U.S. Immigration and Customs Enforcement (ICE). All assets are now property of the United States Government. Unauthorized distribution is a federal offense. Deportation proceedings initiated.
