using System.Collections.Generic;
using WebApi.Models;

namespace WebApi.Interfaces
{
    public interface IItemService
    {
        Item GetItemById(int id);
        IEnumerable<Item> GetAllItems();
        void CreateItem(Item item);
        void UpdateItem(Item item);
        void DeleteItem(int id);
    }
}