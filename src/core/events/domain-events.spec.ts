import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'
import { vi } from 'vitest'

// event that identifies what events happened in one entity
class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date
  private aggregate: CustomAggregate // eslint-disable-line

  constructor(aggregate: CustomAggregate) {
    this.ocurredAt = new Date()
    this.aggregate = aggregate
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

// when an entity was created, add an add events that ocurred
class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvents(new CustomAggregateCreated(aggregate))

    return aggregate
  }
}

describe('Domain Event', () => {
  it('should be able to dispatch and listen to events', () => {
    // watching event subscriber
    const callbackSpy = vi.fn()

    // Subscriber registered (listening to event "answer created")
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    // creating a answer without save in the DB
    const aggregate = CustomAggregate.create()

    // expect event was created but it wasn't dispatched
    expect(aggregate.domainEvents).toHaveLength(1)

    // Saving the answer in the DB and dispatching the event
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    // Subscriber listen event and make the process
    expect(callbackSpy).toHaveBeenCalled()
    // expect when finished that events must be empty
    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
