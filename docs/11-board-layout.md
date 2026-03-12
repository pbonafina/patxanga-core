# PATXANGA — Layout Oficial do Tabuleiro v1.0

## 1. Dimensão

- 15 x 15
- Coordenadas de 1 a 15
- Primeira jogada obrigatoriamente deve passar pelo centro (8,8)

---

## 2. Siglas Oficiais de Multiplicadores

- NM = Normal
- LD = Letra Dupla
- LT = Letra Tripla
- PD = Palavra Dupla
- PT = Palavra Tripla

---

## 3. Distribuição Oficial

Legenda visual simplificada:

    1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
1   PT NM NM LD NM NM NM PD NM NM NM LD NM NM PT
2   NM PD NM NM NM LT NM NM NM LT NM NM NM PD NM
3   NM NM PD NM NM NM LD NM LD NM NM NM PD NM NM
4   LD NM NM PD NM NM NM LD NM NM NM PD NM NM LD
5   NM NM NM NM PD NM NM NM NM PD NM NM NM NM NM
6   NM LT NM NM NM LT NM NM NM LT NM NM NM LT NM
7   NM NM LD NM NM NM LD NM LD NM NM NM LD NM NM
8   PD NM NM LD NM NM NM PD NM NM NM LD NM NM PD
9   NM NM LD NM NM NM LD NM LD NM NM NM LD NM NM
10  NM LT NM NM NM LT NM NM NM LT NM NM NM LT NM
11  NM NM NM NM PD NM NM NM NM PD NM NM NM NM NM
12  LD NM NM PD NM NM NM LD NM NM NM PD NM NM LD
13  NM NM PD NM NM NM LD NM LD NM NM NM PD NM NM
14  NM PD NM NM NM LT NM NM NM LT NM NM NM PD NM
15  PT NM NM LD NM NM NM PD NM NM NM LD NM NM PT

---

## 4. Quantidade Total de Casas

- PT: 4
- PD: 17
- LT: 8
- LD: 24
- NM: restante

---

## 5. Princípios Estratégicos

- PT apenas nos cantos
- Centro (8,8) é PD
- Eixo central possui PD adicionais
- Mais LD do que LT
- Layout simétrico
- Jogo técnico e equilibrado
- Patxanga Real pode dobrar o resultado final da jogada

---

## 6. Observações Técnicas

O estado do tabuleiro será armazenado como matriz 15x15 contendo:

{
  "tile": null | {objeto_da_peca},
  "multiplier_type": "NM|LD|LT|PD|PT"
}

Multiplicadores só são aplicados quando a casa recebe peça pela primeira vez.
Após ocupação, multiplicador não é reaplicado.