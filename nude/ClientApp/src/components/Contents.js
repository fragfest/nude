import React, { Component } from 'react';

export class Contents extends Component {

  // INIT

  constructor(props) {
    super(props);
    this.state = {
      itemsByCategory: [],
      items: [],
      total: 0,
      newName: '',
      newAmount: 0,
      newCategory: 'Electronics',
      categoryList: [],
    };

    this.add = this.add.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.amountChange = this.amountChange.bind(this);
    this.categoryChange = this.categoryChange.bind(this);
    this.delete = this.delete.bind(this);
    this.renderCategoryList = this.renderCategoryList.bind(this);
  };

  componentDidMount() {
    this.getContents();
    this.getCategories();
  };

  ///////////////////////////////////////////////////////////////////////////////////////////
  // RENDER FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////////////////////

  static renderTable(items, total, deleteFn){
    return (
      <table key={ items[0].category } className="table table-bordered table-striped">
        <thead>
          <tr>
            <td><strong> { items[0].category } </strong></td>
            <td><strong> $ { total } </strong></td>
          </tr>
        </thead>
        <tbody>
        {
            items.map(x =>
              <tr key={ x.name }>
                <td>{ x.name } </td>
                <td width="150px">$ { x.value }</td>
                <td width="50px">
                  <button className="btn btn-outline-danger" onClick={ () => deleteFn(x.name) }><i className="fa fa-trash" ></i></button>
                  </td>
              </tr>
            )
          }
        </tbody>
      </table>
    );
  };

  renderCategoryList(categoryList){
    return categoryList.map(c => 
      <option key={ c } >{ c }</option>
    );
  };

  render() {
    const itemsByCategory = this.state.itemsByCategory || [];
    const categoryList = this.state.categoryList || [];

    return (
      <div className="container">
        <div className="row col-lg-12">
          <h1>Contents Calculator</h1>
          {
            itemsByCategory.map(cat => 
              Contents.renderTable(cat.items, cat.total, this.delete)
            )
          }
        </div>
        <div className="row col-lg-12">
          <h5>Total $ { this.state.total } </h5>
        </div>

        <div className="row col-lg-12">
          <div className="form-inline">
            <input className="form-control" type="text" value={this.state.newName} onChange={this.nameChange} placeholder="Item Name"></input>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text ml-1">$</div>
              </div>
              <input className="form-control" type="number" value={this.state.newAmount} onChange={this.amountChange} ></input>
            </div>
            <select className="form-control ml-1" value={this.state.newCategory} onChange={this.categoryChange}>
              { this.renderCategoryList(categoryList) }
            </select>
            <button className="btn btn-outline-primary ml-1" onClick={this.add}>Add</button>
          </div>
        </div>
      </div>
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // GUI FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////////////////////

  nameChange(e){ this.setState({newName: e.target.value}); };
  amountChange(e){ this.setState({newAmount: e.target.value}); };
  categoryChange(e){ this.setState({newCategory: e.target.value}); };

  async add(){
    const isNameDuplicate = this.state.items.find(i => i.name === this.state.newName);
    if(isNameDuplicate){
      //TODO display error to user
      console.error('add() :: Name not unique');
      return;
    }
    if(!this.state.newName){
      return;
    }
    if(this.state.newAmount <= 0){
      return;
    }

    await this.postContentsItem({
      name: this.state.newName,
      category: this.state.newCategory,
      value: parseInt( this.state.newAmount ),
    });

    this.setState({newName: ''});
    this.setState({newAmount: 0});
    this.getContents();
  };

  ///////////////////////////////////////////////////////////////////////////////////////////
  // SERVER CALL FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////////////////////

  async getContents() {
    const response = await fetch('contents');
    const data = await response.json() || [];

    const total = itemArr => itemArr.reduce( (a, v) => a + v.value, 0);
    const items = data.sort( (a, b) => (a.category < b.category) ? 1 : -1 );

    const categoryMap = new Map();
    items.forEach(item => {
      const cat = categoryMap.get(item.category) || {};
      const itemsByCategory = cat.items || [];
      itemsByCategory.push(item);
      categoryMap.set(item.category, { items: itemsByCategory });
    });

    let itemsByCategory = [];
    categoryMap.forEach( (v, k) => itemsByCategory.push({
      name: k,
      items: v.items,
      total: total(v.items)
    }) );

    const totalAll = total(items);
    this.setState({ itemsByCategory: itemsByCategory, items: items, total: totalAll });
  };

  async getCategories() {
    const response = await fetch('category');
    const data = await response.json() || [];
    this.setState({ categoryList: data })
  };

  async postContentsItem(item) {
    return await fetch('contents', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: item.category,
        name: item.name,
        value: item.value,
      })
    });
  };

  async delete(name) {
    const response = await fetch('contents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name })
    });

    if(response.ok){
      this.getContents();
    }
  };

}
