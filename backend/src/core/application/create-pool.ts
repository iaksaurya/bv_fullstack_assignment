import type { PoolMemberResult } from '../domain/compliance.js';
import type { PoolRepository } from '../ports/repositories.js';

type MutableMember = PoolMemberResult;

export class CreatePool {
  constructor(private readonly poolRepository: PoolRepository) {}

  async execute(input: { year: number; members: Array<{ shipId: string; cbBefore: number }> }) {
    const total = input.members.reduce((sum, member) => sum + member.cbBefore, 0);
    if (total < 0) {
      throw new Error('Pool sum must be non-negative');
    }

    const mutable: MutableMember[] = input.members.map((member) => ({
      shipId: member.shipId,
      cbBefore: member.cbBefore,
      cbAfter: member.cbBefore
    }));

    const surplus = mutable
      .filter((member) => member.cbBefore > 0)
      .sort((a, b) => b.cbAfter - a.cbAfter);

    const deficits = mutable
      .filter((member) => member.cbBefore < 0)
      .sort((a, b) => a.cbAfter - b.cbAfter);

    for (const deficit of deficits) {
      let need = -deficit.cbAfter;
      if (need <= 0) continue;

      for (const donor of surplus) {
        if (need <= 0) break;
        if (donor.cbAfter <= 0) continue;

        const transfer = Math.min(donor.cbAfter, need);
        donor.cbAfter -= transfer;
        deficit.cbAfter += transfer;
        need -= transfer;
      }
    }

    for (const member of mutable) {
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        throw new Error('Deficit ship cannot exit worse');
      }
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        throw new Error('Surplus ship cannot exit negative');
      }
    }

    return this.poolRepository.createPool(input.year, mutable);
  }
}
