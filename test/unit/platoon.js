import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeLorean } from '../../src/de-lorean';
import { Platoon } from '../../src/platoon';

describe('Platoon', () => {
    describe('join()', ({ skip }) => {
        // @todo
        skip();
    });

    describe('leave()', ({ skip }) => {
        // @todo
        skip();
    });

    describe('reset()', () => {
        let platoon;
        let vehicles;

        beforeEach(() => {
            vehicles = [{ deLorean: { reset: vi.fn() } }, { deLorean: { reset: vi.fn() } }];

            platoon = new Platoon(...vehicles);
        });

        it('should call reset() on each deLorean', () => {
            platoon.reset();

            expect(vehicles[0].deLorean.reset).to.have.been.calledOnce;
            expect(vehicles[1].deLorean.reset).to.have.been.calledOnce;
        });
    });

    describe('travel()', () => {
        let distance;
        let platoon;
        let vehicles;

        beforeEach(() => {
            distance = 8;

            vehicles = [
                { deLorean: new DeLorean(), scale: 1000 },
                { deLorean: new DeLorean(), scale: 1 }
            ];

            vi.spyOn(vehicles[0].deLorean, 'travel');
            vi.spyOn(vehicles[1].deLorean, 'travel');

            platoon = new Platoon(...vehicles);
        });

        describe('without any scheduled function', () => {
            it('should call travel() on each deLorean with the scaled distance', () => {
                platoon.travel(distance);

                expect(vehicles[0].deLorean.travel).to.have.been.calledOnce;
                expect(vehicles[0].deLorean.travel).to.have.been.calledWith(distance * vehicles[0].scale);
                expect(vehicles[1].deLorean.travel).to.have.been.calledOnce;
                expect(vehicles[1].deLorean.travel).to.have.been.calledWith(distance * vehicles[1].scale);
            });
        });

        describe('with a scheduled function', () => {
            let position;

            beforeEach(() => {
                position = 1;

                vehicles[0].deLorean.schedule(position * vehicles[0].scale, () => {});
            });

            it('should call travel() for each stopover on each deLorean with the scaled distance', () => {
                return platoon.travel(distance).then(() => {
                    expect(vehicles[0].deLorean.travel).to.have.been.calledTwice;
                    expect(vehicles[0].deLorean.travel).to.have.been.calledWith(position * vehicles[0].scale);
                    expect(vehicles[0].deLorean.travel).to.have.been.calledWith((distance - position) * vehicles[0].scale);
                    expect(vehicles[1].deLorean.travel).to.have.been.calledTwice;
                    expect(vehicles[1].deLorean.travel).to.have.been.calledWith(position * vehicles[1].scale);
                    expect(vehicles[1].deLorean.travel).to.have.been.calledWith((distance - position) * vehicles[1].scale);
                });
            });
        });

        describe('with a promise scheduled to resolve', () => {
            let func;
            let position;

            beforeEach(() => {
                func = vi.fn();
                position = 1;

                new Promise((resolve) => {
                    vehicles[0].deLorean.schedule(position * vehicles[0].scale, resolve);
                }).then(func);
            });

            it('shoud execute a scheduled function at the desired position', () => {
                return platoon.travel(position).then(() => {
                    expect(func).to.have.been.calledOnce;
                });
            });
        });
    });
});
