import { spy, stub } from 'sinon';
import { DeLorean } from '../../src/de-lorean';
import { Platoon } from '../../src/platoon';

describe('Platoon', () => {

    describe('join()', () => {

        // @todo

    });

    describe('leave()', () => {

        // @todo

    });

    describe('reset()', () => {

        let platoon;
        let vehicles;

        beforeEach(() => {
            vehicles = [
                { deLorean: { reset: spy() } },
                { deLorean: { reset: spy() } }
            ];

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

            stub(vehicles[0].deLorean, 'travel').callThrough();
            stub(vehicles[1].deLorean, 'travel').callThrough();

            platoon = new Platoon(...vehicles);
        });

        describe('without any scheduled function', () => {

            it('should call travel() on each deLorean with the scaled distance', () => {
                platoon.travel(distance);

                expect(vehicles[0].deLorean.travel).to.have.been.calledOnce;
                expect(vehicles[0].deLorean.travel).to.have.been.calledWithExactly(distance * vehicles[0].scale);
                expect(vehicles[1].deLorean.travel).to.have.been.calledOnce;
                expect(vehicles[1].deLorean.travel).to.have.been.calledWithExactly(distance * vehicles[1].scale);
            });

        });

        describe('with a scheduled function', () => {

            let position;

            beforeEach(() => {
                position = 1;

                vehicles[0].deLorean.schedule(position * vehicles[0].scale, () => { });
            });

            it('should call travel() for each stopover on each deLorean with the scaled distance', () => {
                platoon.travel(distance);

                expect(vehicles[0].deLorean.travel).to.have.been.calledTwice;
                expect(vehicles[0].deLorean.travel).to.have.been.calledWithExactly(position * vehicles[0].scale);
                expect(vehicles[0].deLorean.travel).to.have.been.calledWithExactly((distance - position) * vehicles[0].scale);
                expect(vehicles[1].deLorean.travel).to.have.been.calledTwice;
                expect(vehicles[1].deLorean.travel).to.have.been.calledWithExactly(position * vehicles[1].scale);
                expect(vehicles[1].deLorean.travel).to.have.been.calledWithExactly((distance - position) * vehicles[1].scale);
            });

        });

    });

});
