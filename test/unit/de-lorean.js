import { DeLorean } from '../../src/de-lorean';
import { spy } from 'sinon';

describe('DeLorean', () => {
    let deLorean;

    beforeEach(() => {
        deLorean = new DeLorean();
    });

    describe('nextStopover', () => {
        describe('without any scheduled function', () => {
            it('shoud default to infinity', () => {
                expect(deLorean.nextStopover).to.equal(Number.POSITIVE_INFINITY);
            });
        });

        describe('with a scheduled function', () => {
            let position;

            beforeEach(() => {
                position = 10;

                deLorean.schedule(position, () => {});
            });

            it('shoud equal to the position of the next event', () => {
                expect(deLorean.nextStopover).to.equal(position);
            });
        });

        describe('with a canceled function', () => {
            beforeEach(() => {
                const ticket = deLorean.schedule(10, () => {});

                deLorean.cancel(ticket);
            });

            it('shoud equal to infinity', () => {
                expect(deLorean.nextStopover).to.equal(Number.POSITIVE_INFINITY);
            });
        });

        describe('with an executed function', () => {
            beforeEach(() => {
                const position = 10;

                deLorean.schedule(position, () => {});
                deLorean.travel(position);
            });

            it('shoud equal to infinity', () => {
                expect(deLorean.nextStopover).to.equal(Number.POSITIVE_INFINITY);
            });
        });

        describe('with a call to reset()', () => {
            beforeEach(() => {
                deLorean.schedule(10, () => {});
                deLorean.reset();
            });

            it('shoud equal to infinity', () => {
                expect(deLorean.nextStopover).to.equal(Number.POSITIVE_INFINITY);
            });
        });
    });

    describe('position', () => {
        describe('without any traveled distance', () => {
            it('shoud default to zero', () => {
                expect(deLorean.position).to.equal(0);
            });
        });

        describe('with some distance traveled', () => {
            beforeEach(() => {
                deLorean.travel(17);
                deLorean.travel(13);
            });

            it('shoud equal to the traveled distance', () => {
                expect(deLorean.position).to.equal(30);
            });
        });

        describe('with a call to reset()', () => {
            beforeEach(() => {
                deLorean.travel(17);
                deLorean.reset();
            });

            it('shoud equal to zero', () => {
                expect(deLorean.position).to.equal(0);
            });
        });
    });

    describe('cancel()', () => {
        describe('with a made up ticket', () => {
            let ticket;

            beforeEach(() => {
                ticket = 83;
            });

            it('shoud allow to cancel the ticket', () => {
                deLorean.cancel(ticket);
            });
        });

        describe('with a ticket', () => {
            let ticket;

            beforeEach(() => {
                ticket = deLorean.schedule(12, () => {});
            });

            it('shoud allow to cancel the ticket', () => {
                deLorean.cancel(ticket);
            });
        });
    });

    describe('schedule()', () => {
        it('shoud return a ticket', () => {
            const ticket = deLorean.schedule(12, () => {});

            expect(ticket).to.be.a('number');
        });

        it('shoud return a unique ticket', () => {
            const tickets = [deLorean.schedule(19, () => {}), deLorean.schedule(21, () => {})];

            expect(tickets[0]).to.not.equal(tickets[1]);
        });
    });

    describe('travel()', () => {
        describe('with a scheduled function', () => {
            let func;

            beforeEach(() => {
                func = spy();

                deLorean.schedule(10, func);
            });

            it('shoud execute a scheduled function at the desired position', () => {
                deLorean.travel(9);

                expect(func).to.have.not.been.called;

                deLorean.travel(1);

                expect(func).to.have.been.calledOnce;
            });
        });

        describe('with a scheduled function returning a promise which resolves in its mircotask', () => {
            let func;

            beforeEach(() => {
                func = spy();

                deLorean.schedule(10, () => {
                    return new Promise((resolve) => resolve()).then(func);
                });
            });

            it('shoud execute a scheduled function at the desired position', () => {
                return deLorean
                    .travel(9)
                    .then(() => expect(func).to.have.not.been.called)
                    .then(() => deLorean.travel(1))
                    .then(() => expect(func).to.have.been.calledOnce);
            });
        });

        describe('with a scheduled function returning a promise which does not resolve in its mircotask', () => {
            let func;

            beforeEach(() => {
                func = spy();

                deLorean.schedule(10, () => {
                    return new Promise((resolve) => {
                        setTimeout(() => resolve()); // eslint-disable-line no-undef
                    }).then(func);
                });
            });

            it('shoud throw an error', (done) => {
                deLorean
                    .travel(9)
                    .then(() => expect(func).to.have.not.been.called)
                    .then(() => deLorean.travel(1))
                    .catch((err) => {
                        expect(err.message).to.equal("Sorry, it's not allowed to initialize a promise within a scheduled function.");

                        done();
                    });
            });
        });

        describe('with two functions scheduled at the same time', () => {
            let functions;

            beforeEach(() => {
                functions = [spy(), spy()];

                deLorean.schedule(10, functions[0]);
                deLorean.schedule(10, functions[1]);
            });

            it('shoud execute both scheduled functions at the desired position', () => {
                deLorean.travel(9);

                expect(functions[0]).to.have.not.been.called;
                expect(functions[1]).to.have.not.been.called;

                deLorean.travel(1);

                expect(functions[0]).to.have.been.calledOnce;
                expect(functions[1]).to.have.been.calledOnce;
            });
        });

        describe('with a canceled function', () => {
            let func;
            let position;

            beforeEach(() => {
                func = spy();
                position = 10;

                const ticket = deLorean.schedule(position, func);

                deLorean.cancel(ticket);
            });

            it('shoud not execute a canceled function', () => {
                deLorean.travel(position);

                expect(func).to.have.not.been.called;
            });
        });
    });
});
