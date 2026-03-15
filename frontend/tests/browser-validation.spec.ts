import { expect, test } from "@playwright/test";

test.describe("browser validation scenarios", () => {
  test("runs invite, lobby, resume and forfeit flows from the test page", async ({
    page,
  }) => {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Patxanga" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Cenarios de validacao browser" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Alternar host e guest" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Gerar cenarios de validacao" }).click();

    const scenarioACard = page.getByTestId("browser-scenario-acceptStartResumeForfeit");
    const scenarioBCard = page.getByTestId("browser-scenario-declineInvite");

    await expect(scenarioACard).toBeVisible();
    await expect(scenarioBCard).toBeVisible();

    await page.getByRole("button", { name: "Carregar convites e partidas retomaveis" }).click();
    await page.getByRole("button", { name: "Aceitar convite" }).click();
    await expect(page.getByText("Convite aceito. A partida foi aberta nesta sessão.")).toBeVisible();

    await page.getByRole("button", { name: "Abrir como host" }).click();
    await page.getByRole("button", { name: "Iniciar partida do lobby" }).click();
    await expect(page.getByText("Lobby iniciado com sucesso.")).toBeVisible();

    await page.getByRole("button", { name: "Abrir como guest" }).click();
    await page.getByRole("button", { name: "Carregar convites e partidas retomaveis" }).click();
    await page.getByRole("button", { name: "Retomar partida" }).click();
    await expect(page.getByText("Partida retomada com sucesso.")).toBeVisible();

    await page.getByRole("button", { name: "Desistir da partida" }).click();
    await expect(page.getByText("Desistência registrada com sucesso.")).toBeVisible();

    await scenarioBCard.getByTestId("browser-scenario-declineInvite-use-guest").click();
    await page.getByRole("button", { name: "Carregar convites e partidas retomaveis" }).click();
    await page.getByRole("button", { name: "Recusar convite" }).click();
    await expect(page.getByText("Convite recusado com sucesso.")).toBeVisible();
  });

  test("associates a local rack slot to the board without affecting gameplay state", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Partida local rápida" })).toBeVisible();

    await page.getByTestId("quick-match-create").click();

    const slot = page.getByTestId("rack-slot-1");
    const boardCell = page.getByTestId("board-cell-0-0");

    await expect(slot).toBeVisible();
    await expect(boardCell).toBeVisible();

    await slot.click();
    await boardCell.click();

    await expect(page.getByTestId("rack-slot-1-association")).toHaveText("1,1");
    await expect(page.getByTestId("board-cell-0-0-slot-badges")).toContainText("S1");

    await boardCell.click();

    await expect(page.getByTestId("rack-slot-1-association")).toHaveCount(0);
    await expect(page.getByTestId("board-cell-0-0-slot-badges")).toHaveCount(0);
  });
});
