/**
 * Playing around with ES6 classes and inheritance, as well as JSDOC
 */


/**
 * Person object
 */
class Person {

  firstName:string;
  lastName:string;
  parents:Parent[];
  /**
   * constructor - build a person
   *
   * @param  {string} firstName description
   * @param  {string} lastName  description
   * @return {void}           description
   */
  constructor(firstName, lastName){
    this.firstName = firstName;
    this.lastName = lastName;


     this.parents = [];
  }

  printName(){
    console.log(`${this.firstName} ${this.lastName}`);
  }

}


/**
 * Parent onject
 */
class Parent extends Person {

  children:Person[]; 
  /**
   * constructor - build a parent
   *
   * @param  {string} firstName description
   * @param  {string} lastName  description
   * @param  {Person[]} children  description
   * @return {void}           description
   */
  constructor(firstName, lastName, children){
    super(firstName, lastName);
    this.children = children;
  }

  printChildren(){
    this.children.forEach(child => {
      child.printName();
    });

  }

}
