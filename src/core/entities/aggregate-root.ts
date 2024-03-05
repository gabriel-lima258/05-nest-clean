import { DomainEvent } from '../events/domain-event'
import { DomainEvents } from '../events/domain-events'
import { Entity } from './entity'

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  // pre dispatch the exists events
  protected addDomainEvents(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent)
    // prepare the domain events to be dispatched
    DomainEvents.markAggregateForDispatch(this)
  }

  // clear the domain events
  public clearEvents() {
    this._domainEvents = []
  }
}
