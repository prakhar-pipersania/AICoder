using System.Collections.Generic;
using System.Linq;
using WebApi.Interfaces;
using WebApi.Models;

namespace WebApi.Data
{
    public class InMemoryRepository : IItemRepository
    {
        private readonly List<Item> _items = new List<Item>();
        private int _nextId = 1;

        public Item GetById(int id)
        {
            return _items.FirstOrDefault(i => i.Id == id);
        }

        public IEnumerable<Item> GetAll()
        {
            return _items;
        }

        public void Add(Item item)
        {
            item.Id = _nextId++;
            _items.Add(item);
        }

        public void Update(Item item)
        {
            var existingItem = GetById(item.Id);
            if (existingItem != null)
            {
                existingItem.Name = item.Name;
                existingItem.Description = item.Description;
            }
        }

        public void Delete(int id)
        {
            var itemToRemove = GetById(id);
            if (itemToRemove != null)
            {
                _items.Remove(itemToRemove);
            }
        }
    }
}