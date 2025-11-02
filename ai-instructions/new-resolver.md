# Instruction: Create a new shared Angular Route Resolver

## Goal

This instruction guides the AI to create a new, functional Angular route resolver inside the `projects/shared/resolvers` directory and ensure it is properly exported from the barrel file (`index.ts`) in alphabetical order.

## Pre-computation Analysis

1.  **Identify the `resolvers` directory**: The primary location for resolvers is `projects/shared/resolvers/`.
2.  **Identify the barrel file**: The barrel file is `projects/shared/resolvers/index.ts`.
3.  **Analyze existing resolvers**: Review other resolvers in the directory. Modern Angular resolvers are typically functions (`ResolveFn`) that return an `Observable`, `Promise`, or a plain value.

## User Interaction

1.  **Ask for the resolver name**:
    *   Example: "What data will this resolver be for? (e.g., UserProfile, SeoData)"
    *   The user will provide a name.

## Execution Steps

1.  **Generate the resolver file**:
    *   Create a new file with the `.resolver.ts` extension (e.g., `seo-data.resolver.ts`).
    *   The file name should be kebab-case.
    *   The exported resolver function should be camelCase with a `Resolver` suffix (e.g., `seoDataResolver`).
    *   The resolver should be a `ResolveFn` function.
    *   Inject necessary services to fetch the required data.

2.  **Update the barrel file**:
    *   Open `projects/shared/resolvers/index.ts`.
    *   Insert a new export statement for the newly created resolver file in alphabetical order.
    *   Example: `export * from './seo-data.resolver';`

## Example Resolver File

Filename: `projects/shared/resolvers/seo.resolver.ts`

```typescript
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { SeoSocialShare } from '@shared/interfaces';
import { SeoSocialShareService } from '@shared/services';
import { SEO_CONFIG } from '@shared/constants';
import { SeoType } from '@shared/enums';

export const seoResolver: ResolveFn<SeoSocialShare> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
  const seoService = inject(SeoSocialShareService);
  const seoType: SeoType = route.data['seoType'] || SeoType.DEFAULT;
  const seo = SEO_CONFIG[seoType];
  seoService.setData(seo);
  return seo;
};
```

## Example Barrel File Update

File: `projects/shared/resolvers/index.ts`

```typescript
// Insert the new export in alphabetical order
export * from './seo.resolver';
```
