// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  Organization,
  OrganizationCreateFormData,
  OrganizationResponse,
  OrganizationUpdateTextFormData,
} from "~/types/communities/organization";
import type { AddPayload } from "~/types/social-links-payload";

interface OrganizationStore {
  loading: boolean;
  organization: Organization;
  organizations: Organization[];
}

export const useOrganizationStore = defineStore("organization", {
  // MARK: Properties

  state: (): OrganizationStore => ({
    loading: false,

    organization: {
      id: "",
      orgName: "",
      name: "",
      tagline: "",
      createdBy: "",
      iconUrl: "",

      location: { id: "", lat: "", lon: "", bbox: [""], displayName: "" },

      getInvolvedUrl: "",
      socialLinks: [],
      status: 1,
      creationDate: "",

      groups: [],
      events: [],

      texts: {
        id: 0,
        orgId: "",
        iso: "",
        primary: false,
        description: "",
        getInvolved: "",
        donationPrompt: "",
      },
    },

    organizations: [],
  }),
  actions: {
    // MARK: Create

    async create(formData: OrganizationCreateFormData) {
      this.loading = true;

      const token = localStorage.getItem("accessToken");

      const responseOrg = await useFetch(
        `${BASE_BACKEND_URL}/communities/organizations/`,
        {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            location: formData.location,
            tagline: formData.tagline,
            social_accounts: formData.social_accounts,
            created_by: "cdfecc96-2dd5-435b-baba-a7610afee70e",
            description: formData.description,
            topics: formData.topics,
            high_risk: false,
            total_flags: 0,
            acceptance_date: new Date(),
          }),
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const responseOrgData = responseOrg.data.value as unknown as Organization;

      if (responseOrg) {
        this.loading = false;
        return responseOrgData.id;
      }

      this.loading = false;
      return false;
    },

    // MARK: Fetch By ID

    async fetchById(id: string | undefined) {
      this.loading = true;

      const { data, status } = await useAsyncData<OrganizationResponse>(
        async () =>
          (await fetchWithoutToken(
            `/communities/organizations/${id}/`,
            {}
          )) as OrganizationResponse
      );

      if (status.value === "success") {
        const organization = data.value!;

        this.organization.id = organization.id;
        this.organization.orgName = organization.orgName;
        this.organization.name = organization.name;
        this.organization.tagline = organization.tagline;
        this.organization.iconUrl = organization.iconUrl;

        this.organization.location = organization.location;

        this.organization.getInvolvedUrl = organization.getInvolvedUrl;
        this.organization.socialLinks = organization.socialLinks;
        this.organization.status = organization.status;

        this.organization.texts = organization.texts[0];

        this.organization.groups = organization.groups;
        this.organization.events = organization.events;
      }

      this.loading = false;
    },

    // MARK: Fetch All

    async fetchAll() {
      this.loading = true;

      const { data, status } = await useAsyncData<OrganizationResponse[]>(
        async () =>
          (await fetchWithoutToken(
            `/communities/organizations/`,
            {}
          )) as OrganizationResponse[]
      );

      if (status.value === "success") {
        const organizations = data.value!.map((org: OrganizationResponse) => {
          return {
            id: org.id,
            orgName: org.orgName,
            name: org.name,
            tagline: org.tagline,
            createdBy: org.createdBy,
            iconUrl: org.iconUrl,

            location: org.location,

            getInvolvedUrl: org.getInvolvedUrl,
            socialLinks: org.socialLinks,
            status: org.status,
            creationDate: org.creationDate,

            groups: org.groups,
            events: org.events,

            texts: org.texts[0],
          };
        });

        this.organizations = organizations;
      }

      this.loading = false;
    },

    // MARK: Update Texts

    async updateTexts(
      org: Organization,
      formData: OrganizationUpdateTextFormData
    ) {
      this.loading = true;

      const token = localStorage.getItem("accessToken");

      const responseOrg = await $fetch(
        BASE_BACKEND_URL + `/communities/organizations/${org.id}/`,
        {
          method: "PUT",
          body: {
            ...org,
            getInvolvedUrl: formData.getInvolvedUrl,
          },
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const responseOrgTexts = await $fetch(
        BASE_BACKEND_URL + `/communities/organization_texts/${org.texts.id}/`,
        {
          method: "PUT",
          body: {
            primary: true,
            description: formData.description,
            getInvolved: formData.getInvolved,
            donate_prompt: "",
            orgId: org.id,
            iso: "en",
          },
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (responseOrg && responseOrgTexts) {
        this.organization.texts.description = formData.description;
        this.organization.texts.getInvolved = formData.getInvolved;
        this.organization.getInvolvedUrl = formData.getInvolvedUrl;

        this.loading = false;

        return true;
      }

      return false;
    },

    // MARK: Add Social Links

    async createSocialMediaLink(org: Organization, payload: AddPayload) {
      // TODO: PUT/POST payload, PUT/POST org and social link id's in bridge table
      //         content/social_links
      // TODO: Other PUT's/POST's?
      //         bridge table: organization_social_links

      this.loading = true;

      const token = localStorage.getItem("accessToken");

      const responseSocialLinks = await useFetch(
        `${BASE_BACKEND_URL as string}/communities/organization_social_links/`,
        // `${BASE_BACKEND_URL as string}/communities/organizations/social_links/`,
        // `${BASE_BACKEND_URL as string}/communities/social_links/`,
        {
          method: "POST",
          body: JSON.stringify({
            link: payload.link,
            label: payload.label,
            order: 0,
          }),
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log(
        "createSocialMediaLink responseSocialLinks.data:",
        responseSocialLinks.data
      );

      const responseSocialLinksData = responseSocialLinks.data
        .value as unknown as Organization;

      if (responseSocialLinksData) {
        this.loading = false;

        // return responseSocialLinksData.id;
        // return responseSocialLinksData;
        return { status: true, data: "Added social media link data." };
      }

      return { status: false, data: "Unable to add social media link data." };
    },

    // MARK: Delete

    async delete() {
      this.loading = true;

      this.loading = false;
    },
  },
});
