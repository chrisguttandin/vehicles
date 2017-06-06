import Decimal from 'decimal.js';
import { DeLorean } from './de-lorean';
import { IVehicle } from './interfaces';

export class Platoon implements IVehicle {

    private _vehicles: { deLorean: DeLorean, scale: number }[];

    constructor (...vehicles: { deLorean: DeLorean, scale: number }[]) {
        this._vehicles = vehicles;
    }

    public join (deLorean: DeLorean, scale: number) {
        this._vehicles.push({ deLorean, scale });
    }

    public leave (deLorean: DeLorean) {
        const index = this._vehicles.findIndex(({ deLorean: dLrn }) => deLorean === dLrn);

        if (index > -1) {
            this._vehicles.splice(index, 1);
        }
    }

    public reset () {
        this._vehicles.forEach(({ deLorean }) => deLorean.reset());
    }

    public async travel (distance: number) {
        let distanceAsDecimal = new Decimal(distance);

        do {
            const distanceToNextStopover = this._vehicles
                .reduce((distanceAsDecimal, { deLorean, scale }) => {
                    const nextStopoverAsDecimal = new Decimal(deLorean.nextStopover);

                    return Decimal.min(
                        nextStopoverAsDecimal
                            .minus(deLorean.position)
                            .dividedBy(scale),
                        distanceAsDecimal
                    );
                }, distanceAsDecimal);

            await Promise.all(this._vehicles.map(({ deLorean, scale }) => {
                return deLorean.travel(distanceToNextStopover.times(scale).toNumber());
            }));

            distanceAsDecimal = distanceAsDecimal.minus(distanceToNextStopover);
        } while (distanceAsDecimal.greaterThan(0))
    }

}
