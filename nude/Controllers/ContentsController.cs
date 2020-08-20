using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using nude.Models;
using Newtonsoft.Json;

namespace nude.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ContentsController : ControllerBase
    {
        private readonly ILogger<ContentsController> _logger;

        public ContentsController(ILogger<ContentsController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<Item> Get()
        {
          IEnumerable<Item> items = new List<Item>();
          try {
            var jsonIn = System.IO.File.ReadAllText("items.json");
            items = JsonConvert.DeserializeObject<IEnumerable<Item>>(jsonIn) ?? new List<Item>();
          } catch(Exception ex) {
            _logger.LogError(ex, "File Read Error");
          }

          return items;
        }

        [HttpDelete]
        public IActionResult Delete(Item itemDelete)
        {
          IEnumerable<Item> items = new List<Item>();
          try {
            var jsonIn = System.IO.File.ReadAllText("items.json");
            items = JsonConvert.DeserializeObject<IEnumerable<Item>>(jsonIn) ?? new List<Item>();
          } catch(Exception ex) {
            _logger.LogError(ex, "File Read Error");
            return StatusCode(500);
          }

          try{
            var newItems = items.Where(i => i.Name != itemDelete.Name);
            var jsonOut = JsonConvert.SerializeObject(newItems);
            System.IO.File.WriteAllText("items.json", jsonOut);
          } catch(Exception ex){
            _logger.LogError(ex, "File Update Error");
            return StatusCode(404);
          }

          return Ok();
        }

        [HttpPost]
        public Item Post(Item postItem)
        {
          var newItem = new Item {
            Category = postItem.Category,
            Name = postItem.Name ?? "",
            Value = postItem.Value
          };

          try {
            var jsonIn = System.IO.File.ReadAllText("items.json");
            var items = JsonConvert.DeserializeObject<IEnumerable<Item>>(jsonIn) ?? new List<Item>();

            var existingItem = items.Where(i => i.Name == postItem.Name);
            if(existingItem.ToList().Count != 0){
              _logger.LogError( "Duplicate Item Name found");
              return existingItem.ToList()[0];
            }

            var newItems = items.Append(newItem);
            var jsonOut = JsonConvert.SerializeObject(newItems);
            System.IO.File.WriteAllText("items.json", jsonOut);
          } catch(Exception ex){
            _logger.LogError(ex, "File Update Error");
          }

          return newItem;
        }
    }
}
