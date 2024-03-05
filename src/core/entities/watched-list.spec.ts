import { WatchedList } from './watched-list'

// function to use number list as a test
class NumberWatchedList extends WatchedList<number> {
  compareItems(a: number, b: number): boolean {
    return a === b
  }
}

describe('watched list', () => {
  it('should be able to create a watched list with inicial items', () => {
    // inicial = [1, 2, 3]
    const list = new NumberWatchedList([1, 2, 3])
    // currentItems = [1, 2, 3]
    expect(list.currentItems).toHaveLength(3)
  })

  it('should be able to add new items to the list', () => {
    // inicial = [1, 2, 3]
    const list = new NumberWatchedList([1, 2, 3])

    list.add(4) // add item = [1, 2, 3, 4]

    expect(list.currentItems).toHaveLength(4)
    // new item = [4]
    expect(list.getNewItems()).toEqual([4])
  })

  it('should be able to remove items from the list', () => {
    // inicial = [1, 2, 3]
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(2) // remove item = [1, 3]

    expect(list.currentItems).toHaveLength(2)
    // removed item = [2]
    expect(list.getRemovedItems()).toEqual([2])
  })

  it('should be able to add an item even if it was removed before', () => {
    // inicial = [1, 2, 3]
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(2) // remove item = [1, 3]
    list.add(2) // add item = [1, 2, 3]

    expect(list.currentItems).toHaveLength(3)
    // if item was already removed then the list must be empty
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
  })

  it('should be able to remove an item even if it was added before', () => {
    // inicial = [1, 2, 3]
    const list = new NumberWatchedList([1, 2, 3])

    list.add(4) // add item = [1, 2, 3, 4]
    list.remove(4) // remove item = [1, 2, 3]

    expect(list.currentItems).toHaveLength(3)
    // if item was already added then the list must be empty
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
  })

  it('should be able to update watched list items', () => {
    // inicial = [1, 2, 3]
    const list = new NumberWatchedList([1, 2, 3])

    list.update([1, 3, 5]) // update = [1, 3, 5]

    // removed item = [2]
    expect(list.getRemovedItems()).toEqual([2])
    // added item = [5]
    expect(list.getNewItems()).toEqual([5])
  })
})
