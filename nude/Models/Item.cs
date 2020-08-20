using System;

namespace nude.Models
{
    public class Item
    {
        private Categories category = Categories.Electronics;
        public string Category {
            get {
                return this.category.ToString();
            }
            set {
                var enumVal = Enum.Parse(typeof(Categories), value);
                this.category = (Categories) enumVal;
            }
        }

        public string Name { get; set; }

        public int Value { get; set; }

    }

}
