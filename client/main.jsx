import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import './main.html';

const contentSelector = new ReactiveVar('other');

const collection1 = new Mongo.Collection(null);
const collection2 = new Mongo.Collection(null);
const collection3 = new Mongo.Collection(null);

for (let i = 0; i < 1000; i++) {
  const row1 = [];
  const row2 = [];
  const row3 = [];
  for (let j = 0; j < 10; j++) {
    let doc1 = {
      _id: Random.id(),
      cell: {
        value: Random.id()
      }
    };
    let doc2 = {
      _id: Random.id(),
      cell: {
        value: Random.id()
      }
    };
    row1.push(doc1);
    row2.push(doc2);
    if (j % 2 === 0) {
      row3.push(doc1);
    }
    else {
      row3.push(doc2);      
    }
  }
  collection1.insert({row: row1, order: i});
  collection2.insert({row: row2, order: i});
  collection3.insert({row: row3, order: i});
}

class TableCell extends React.Component {
  render() {
    return (
      <td>{this.props.cell.value}</td>
    );
  }
}

class TableRow extends React.Component {
  render() {
    const cells = [];
    this.props.row.forEach((doc, i) => {
      cells.push(
        <TableCell cell={doc.cell} key={doc._id} />
      );
    });
    return (
      <tr>
        {cells}
      </tr>
    );
  }
}

class Table extends React.Component {
  componentDidMount() {
    logTime();
  }

  componentDidUpdate() {
    logTime();
  }

  render() {
    const rows = [];
    this.props.content.forEach((doc, i) => {
      rows.push(
        <TableRow row={doc.row} key={doc._id} />
      );
    });
    return (
      <table>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

const TableContainer = createContainer(() => {
  let collection;
  if (contentSelector.get() === 'table1react') {
    collection = collection1;
  }
  else if (contentSelector.get() === 'table2react') {
    collection = collection2;
  }
  else if (contentSelector.get() === 'table3react') {
    collection = collection3;
  }
  return {
    content: collection.find({}, {sort: {order: 1}}).fetch()
  }
}, Table);

let clickTime = new Date().valueOf();
let previous = null;

function logTime() {
  const difference = new Date().valueOf() - clickTime;
  console.log(`Time ${previous} -> ${contentSelector.get()}: ${difference}`);
}

Template.sidebar.events({
  'click button': function (event, template) {
    clickTime = new Date().valueOf();
    previous = contentSelector.get();
    contentSelector.set(event.currentTarget.className);
  }
});

Template.content.helpers({
  selected(name) {
    return contentSelector.get() === name;
  },

  selectedReact() {
    return contentSelector.get() === 'table1react' || contentSelector.get() === 'table2react' || contentSelector.get() === 'table3react';
  }
});

Template.table1.onRendered(function () {
  logTime();
});

Template.table2.onRendered(function () {
  logTime();
});

Template.table3.onRendered(function () {
  logTime();
});

Template.other.onRendered(function () {
  logTime();
});

Template.table1.helpers({
  content() {
    return collection1.find({}, {sort: {order: 1}});
  }
});

Template.table2.helpers({
  content() {
    return collection2.find({}, {sort: {order: 1}});
  }
});

Template.table3.helpers({
  content() {
    return collection3.find({}, {sort: {order: 1}});
  }
});

function renderTable(template, collection) {
  template.table = document.createElement('table');
  collection.find({}, {sort: {order: 1}}).forEach(function (doc, i, cursor) {
    const row = document.createElement('tr');
    doc.row.forEach(function (column, j) {
      const cell = document.createElement('td');
      cell.textContent = column.cell.value;
      row.appendChild(cell);
    });
    template.table.appendChild(row);
  });
  template.firstNode.parentNode.insertBefore(template.table, null);
}

Template.table1manual.onRendered(function () {
  renderTable(this, collection1);
  logTime();
});

Template.table1manual.onDestroyed(function () {
  this.table.remove();
});

Template.table2manual.onRendered(function () {
  renderTable(this, collection2);
  logTime();
});

Template.table2manual.onDestroyed(function () {
  this.table.remove();
});

Template.table3manual.onRendered(function () {
  renderTable(this, collection3);
  logTime();
});

Template.table3manual.onDestroyed(function () {
  this.table.remove();
});

Template.reactTables.helpers({
  component() {
    return TableContainer;
  }
});

Template.recursive1.helpers({
  nextDepth() {
    return this.depth - 1;
  },
});

Template.recursive1.events({
  'click div'() {
    console.log('Clicked!');
  },
});