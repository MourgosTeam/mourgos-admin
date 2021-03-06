import React, { Component } from 'react';
import Net from '../helpers/net';

import XLSX from 'xlsx'



function getID (i,c) {
  return parseInt(c, 10) * 10000 + parseInt(i, 10);
}

function castProducts(products, catalogueID) {

  let results = [];

  for (var i=0; i < products.length; i+=1) {
    let product = Object.assign({},products[i]);
    product.Attributes = product.Attributes || '';
    const attributes = product.Attributes === '' ? [] : product.Attributes.split(',');    
    // find product id for specific catalogue
    product.id = getID(i+1,catalogueID);
    // fix attributes id and save as array
    let attrarray = [];
    for (var j=0; j < attributes.length; j+=1) {
      attrarray.push(getID(attributes[j], catalogueID));
    }
    product.Attributes = attrarray;
    // no null description
    product.Description = product.Description || "";
    // prefix images
    product.Image = product.Image.length > 2 ? "/images/products/" + product.Image : "";
    
    // fix categoryID
    product.category_id = getID(product.Category, catalogueID);
    delete product.Category;

    results.push(product);
  }
  return results;
}

function castCategories(categories, catalogueID) {

  let results = [];

  for (var i=0; i < categories.length; i+=1) {
    let cat = Object.assign({},categories[i]);
    // find category id for specific catalogue
    cat.id = getID(i+1,catalogueID);
    cat.catalogue_id = catalogueID;
    results.push(cat);
  }
  return results;
}

function castAttributes(attributes, catalogueID) {
  let results = [];

  for (var i=0; i < attributes.length; i+=1) {
    let attribute = Object.assign({},attributes[i]);
    // find category id for specific catalogue
    attribute.id = getID(i+1,catalogueID);
    attribute.Options = JSON.stringify(attribute.Options.split(','));
    console.log(attribute.Options);
    results.push(attribute);
  }
  return results;
}

function calculateConnectors(products) {
  let results = [];

  for (var i=0; i < products.length; i+=1) {
    let attributes = products[i].Attributes || [];
    for (var j=0; j < attributes.length; j+=1) {
      let connector = {};
      connector.id = products[i].id * 1000000 + attributes[j];
      connector.ProductID = products[i].id;
      connector.AttributeID = attributes[j];
      results.push(connector);
    }
    delete products[i].Attributes;
  }
  return results;
}


class ImportView extends Component {

  constructor(props){
    super(props);
    this.state = {
      jsonData: {},
      jsonString: '',
      shop: -1,
      shops: []
    }
    this.loadShops();
  }

  loadShops = () => {
    Net.GetItWithToken('catalogues/?dev=devmode')
    .then((data) => this.setState({
      shops: data
    }));
  }
  to_json = (workbook) => {
    let result = {};
    workbook.SheetNames.forEach(function(sheetName) {
      let roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (roa.length) {
        result[sheetName] = roa;
      }
    });
    return result;
  };

  process_wb = (wb) => {
    const data = this.to_json(wb);
    this.setState({
      jsonData: data,
      jsonString: JSON.stringify(data,2,2) 
    });
  }

  do_file = () => {
    var f = this.file;
    if(!f) return;
    var reader = new FileReader();
    reader.onload = (e) => {
      var data = e.target.result;
      data = new Uint8Array(data);
      this.process_wb(XLSX.read(data, { type: 'array' }));
    };
    reader.readAsArrayBuffer(f);
  }

  changeFile = (files) => {
    this.file = files[0];
  }
  changeShop = (shopID) => {
    this.setState({
      shop: shopID
    });
  }

  getTransaction = () => {
    const json = this.state.jsonData;
    const products = json["Products"];
    const categories = json["Categories"];
    const attributes = json["Attributes"] || [];

    const catalogue = parseInt(this.state.shop, 10);
    const pobj = castProducts(products, catalogue);
    const cobj = castCategories(categories, catalogue);
    const aobj = castAttributes(attributes, catalogue);
    const conns = calculateConnectors(pobj);

    const query = {
      Attributes: aobj,
      Categories: cobj,
      Products: pobj,
      Connectors: conns
    }

    this.setState({
      query: query
    });
  }

  submitImport = () => {
    const query = this.state.query;

    console.log(query);
    Net.PostItWithToken('admin/import', query).then( (data) => {
      console.log(data);
      alert("Successfully imported data!");
      window.location.href = window.location.href.split("#").join('');
    }).catch((e) => null);   

  }

  render() {
    return (
      <div className="container">
        <div className="card">
          <div className="card-block">
            <h4 className="card-title">Import Products</h4>
            <h6 className="card-subtitle mb-2 text-muted">Select shop -> Choose File -> Process -> Get Transaction</h6>
            <div className="card-block">
              <select id="catid" defaultValue={this.state.shop} onChange={(e) => this.changeShop(e.target.value)}>
                <option value="-1">----</option>
                {this.state.shops.map((shop, index) => <option value={shop.id}>{shop.Name}</option>)}
              </select>
              <input type="file" onChange={(e) => this.changeFile(e.target.files)} placeholder="Drop file here..."/>            
            </div>
            <br />
            <div className="card-block">
              <button className="card-link btn btn-primary"  onClick={() => this.do_file()}>Process File</button>
              {this.state.jsonString.length > 5 ? 
                <button className="card-link btn btn-secondary" onClick={() => this.getTransaction()}>Get Transaction</button>
              :''}
            </div>
          </div>
        </div>
        <div>
        {
          this.state.query ? 
          <div>
            
            <span>Attributes: {this.state.query.Attributes.length}</span><br />
            <span>Categories: {this.state.query.Categories.length}</span><br />
            <span>Products: {this.state.query.Products.length}</span><br />
            <span>Connectors: {this.state.query.Connectors.length}</span><br />
            <button className="btn btn-success" onClick={() => this.submitImport()}>Import Data!!!</button>
          </div>

          :''
        }
        </div>
      </div>
    );
  }
}

export default ImportView;
