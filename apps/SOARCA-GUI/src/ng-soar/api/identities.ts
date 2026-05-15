export type CacaoIdentity = {
  type: "identity" | string;
  spec_version?: string;
  id: string;
  created_by_ref?: string;
  created?: string;
  modified?: string;
  name: string;
  description?: string;
  roles?: string[];
  identity_class?: string;
  sectors?: string[];
  contact_information?: string;
};

export type IdentityById = Record<string, CacaoIdentity | undefined>;

async function fetchNgSoarApi<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NG-SOAR API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const getIdentities = () =>
  fetchNgSoarApi<CacaoIdentity[]>("/api/ng-soar/identities");

export function createIdentityMap(identities: CacaoIdentity[]): IdentityById {
  return identities.reduce<IdentityById>((byId, identity) => {
    byId[identity.id] = identity;
    return byId;
  }, {});
}

export function resolveIdentityName(identityId: string | undefined, identities: IdentityById) {
  if (!identityId) {
    return undefined;
  }

  return identities[identityId]?.name ?? identityId;
}
