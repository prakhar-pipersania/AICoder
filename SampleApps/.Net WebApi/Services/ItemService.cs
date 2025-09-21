using System.Collections.Generic;
using WebApi.Interfaces;
using WebApi.Models;

namespace WebApi.Services
{
    public class ItemService : IItemService
    {
        private readonly IItemRepository _itemRepository;

        public ItemService(IItemRepository itemRepository)
        {
            _itemRepository = itemRepository;
        }

        public Item GetItemById(int id)
        {
            return _itemRepository.GetById(id);
        }

        public IEnumerable<Item> GetAllItems()
        {
            return _itemRepository.GetAll();
        }

        public void CreateItem(Item item)
        {
            _itemRepository.Add(item);
        }

        public void UpdateItem(Item item)
        {
            _itemRepository.Update(item);
        }

        public void DeleteItem(int id)
        {
            _itemRepository.Delete(id);
        }
    }
}