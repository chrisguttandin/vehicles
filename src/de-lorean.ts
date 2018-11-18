import Decimal from 'decimal.js';
import { IDefinition, IVehicle } from './interfaces';

// @todo This is normally part of the TypeScript lib 'dom' or of @types/node.
declare function setTimeout (handler: any): number;

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

export class DeLorean implements IVehicle {

    private _definitions: IDefinition[] = [];

    private _ongoingJourney: null | Symbol;

    private _position: number;

    constructor () {
        this._definitions = [];
        this._ongoingJourney = null;
        this._position = 0;
    }

    get nextStopover (): number {
        const nextDefinition = this._definitions[0];

        return (nextDefinition === undefined) ? Number.POSITIVE_INFINITY : nextDefinition.position;
    }

    get position (): number {
        return this._position;
    }

    public cancel (ticket: number): void {
        const index = this._definitions.findIndex(({ ticket: tckt }) => ticket === tckt);

        if (index > -1) {
            this._definitions.splice(index, 1);
        }
    }

    public reset (): void {
        this._definitions.length = 0;
        this._ongoingJourney = null;
        this._position = 0;
    }

    public schedule (position: number, func: Function): number {
        const ticket = this._generateTicket();

        this._definitions.push({ func, position, ticket });
        this._definitions.sort((a, b) => a.position - b.position);

        return ticket;
    }

    public async travel (distance: number): Promise<void> {
        if (this._ongoingJourney !== null) {
            throw new Error('There is currently another journey going on.');
        }

        const journey = Symbol();
        const position = new Decimal(this._position)
            .plus(distance)
            .toNumber();

        this._ongoingJourney = journey;

        while (this._ongoingJourney === journey && this._definitions.length > 0 && this._definitions[0].position <= position) {
            // TypeScript needs to be convinced that the definition is not undefined.
            const { func, position: pstn } = <IDefinition> this._definitions.shift();

            const functions = [ func ];

            while (this._definitions.length > 0 && this._definitions[0].position === pstn) {
                // TypeScript needs to be convinced that the definition is not undefined.
                functions.push((<IDefinition> this._definitions.shift()).func);
            }

            this._position = pstn;

            await Promise
                .all(functions
                    .map((fnc) => Promise
                        .race([
                            new Promise((_, reject) => setTimeout(() => {
                                reject(new Error("Sorry, it's not allowed to initialize a promise within a scheduled function."));
                            })),
                            fnc()
                        ])));
        }

        if (this._ongoingJourney === journey) {
            this._ongoingJourney = null;
            this._position = position;
        }
    }

    private _generateTicket (): number {
        let ticket: number;

        do {
            ticket = Math.round(Math.random() * MAX_SAFE_INTEGER);
        } while (this._definitions.some(({ ticket: tckt }) => ticket === tckt));

        return ticket;
    }

}
