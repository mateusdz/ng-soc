# Architecture Ownership

This repository combines separately licensed open-source components with
Cyentific proprietary platform materials. Keep this boundary explicit in
architecture diagrams, pilot documentation, partner handovers, and
release packages.

## Open-source boundary

The following components are open-source and retain their own license
terms:

- CACAO Roaster: Apache License 2.0
- SOARCA: Apache License 2.0
- SOARCA GUI: Apache License 2.0

Their open-source licenses apply only to those components and their
own upstream materials.

## Proprietary boundary

Everything else in this repository is Cyentific proprietary material
unless a file, directory, dependency, or third-party component expressly
states a different license or owner.

This includes Cyentific-authored platform composition, deployment
configuration, APIs, user-interface extensions, documentation,
deliverables, integrations, reports, and project-specific material.

## Repository practice

Cyentific-owned material should stay under clearly named platform paths
where possible, such as:

- `apps/ng-soar-api`
- `apps/SOARCA-GUI/src/ng-soar`
- root deployment files such as `docker-compose.yml`
- reverse-proxy configuration in `nginx/`
- Cyentific deliverable material in `deliverable-assets/`

When Cyentific modifies or extends an open-source component, keep the
change easy to identify and document whether it is intended as:

- an upstream contribution under the component's open-source license; or
- a Cyentific proprietary extension or deployment adaptation.

Avoid describing the combined platform as Apache-licensed. The combined
platform is proprietary, while the listed open-source components retain
their own licenses.

## Pilot release checklist

Before releasing a pilot package:

- Include [LICENSE.md](LICENSE.md), [COPYRIGHT.md](COPYRIGHT.md), and
  [NOTICE.md](NOTICE.md).
- Preserve the license files and notices for CACAO Roaster, SOARCA,
  SOARCA GUI, and third-party dependencies.
- Make sure partner-facing diagrams and documentation show the
  open-source/proprietary boundary.
- Verify the Consortium Agreement, Grant Agreement, and any project
  access-rights clauses.

If project agreements require software results or access rights to be
shared among consortium members, align the pilot release terms with
those obligations before distribution.
