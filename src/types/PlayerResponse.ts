export interface PlayerResponse{
  id: string;
  accountId: string;
  accountUsername: string;
  accountEmail: string;

  realmId: number;
  realmName: string;

  gender: boolean;

  rollNum: number;

  realmStage: number;
  realmStageName: string;

  hp: number;
  attack: number;
  defense: number;

  critRate: number;
  critDamage: number;
  speed: number;
  lifeSteal: number;
  cultivationSpeed: number;

  cultivationPoint: number;
  reputation: number;
  spiritStone: number;

  createdAt: string;
}