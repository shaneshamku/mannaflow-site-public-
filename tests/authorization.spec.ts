import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

async function getJson<T>(page: Page, url: string): Promise<T> {
  return page.evaluate(async (requestUrl) => {
    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`${requestUrl} returned ${response.status}`);
    return response.json();
  }, url);
}

test("client users cannot read or enroll internal records; internal admins can read both organizations", async ({ browser }) => {
  const internalContext = await browser.newContext();
  const internalPage = await internalContext.newPage();
  await signIn(internalPage, "dev@local.test", "localdev123");

  const internalLeads = await getJson<Array<{ id: string; name: string | null }>>(internalPage, "/api/leads");
  const internalLead = internalLeads.find((lead) => lead.name === "Internal QA Lead");
  expect(internalLead).toBeDefined();

  const internalApiStatus = await internalPage.evaluate(async (leadId) => {
    return (await fetch(`/api/leads/${leadId}`)).status;
  }, internalLead!.id);
  expect(internalApiStatus).toBe(200);
  await internalContext.close();

  const clientContext = await browser.newContext();
  const clientPage = await clientContext.newPage();
  await signIn(clientPage, "client-demo@local.test", "clientdemo123");

  await expect(clientPage.getByText("Internal QA Lead")).toHaveCount(0);
  const clientCampaigns = await getJson<Array<{ id: string }>>(clientPage, "/api/campaigns");
  expect(clientCampaigns).not.toHaveLength(0);

  const pageResponse = await clientPage.goto(`/leads/${internalLead!.id}`);
  expect(pageResponse?.status()).toBe(404);

  const apiStatus = await clientPage.evaluate(async (leadId) => {
    return (await fetch(`/api/leads/${leadId}`)).status;
  }, internalLead!.id);
  expect(apiStatus).toBe(404);

  const enrollmentStatus = await clientPage.evaluate(async ({ campaignId, leadId }) => {
    const response = await fetch(`/api/campaigns/${campaignId}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    return response.status;
  }, { campaignId: clientCampaigns[0].id, leadId: internalLead!.id });
  expect(enrollmentStatus).toBe(404);
  await clientContext.close();
});
