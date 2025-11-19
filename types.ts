export type DayOfWeek = 'Domingo' | 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';

export interface ActivityOverride {
  name?: string;
  days?: DayOfWeek[];
}

export interface Activity {
  id: string;
  name: string;
  recurrence: 'weekly' | 'once';
  days?: DayOfWeek[]; // Optional, used for 'weekly'
  date?: string; // Optional, used for 'once', format 'yyyy-MM-dd'
  // Key is date string 'yyyy-MM-dd' (start of week)
  overrides?: { [weekIdentifier: string]: ActivityOverride };
  // Key is date string in 'yyyy-MM-dd' format
  completed?: { [date: string]: boolean };
  deletedInWeeks?: string[];
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
}

export interface RedeemedReward extends Reward {
  uniqueId: string; // Unique identifier for this specific redemption instance
  redemptionDate: string; // 'yyyy-MM-dd'
  used: boolean;
}

export interface ChildInfo {
  name: string;
  age: string;
  coins?: number;
  rewards?: Reward[];
  redeemedRewards?: RedeemedReward[];
}