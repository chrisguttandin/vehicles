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

    public travel (distance: number) {
        do {
            const distanceToNextStopover = this._vehicles
                .reduce((distance, { deLorean, scale }) => {
                    return Math.min((deLorean.nextStopover - deLorean.position) / scale, distance);
                }, distance);

            this._vehicles.forEach(({ deLorean, scale }) => deLorean.travel(distanceToNextStopover * scale));

            distance -= distanceToNextStopover;
        } while (distance > 0)
    }

}
