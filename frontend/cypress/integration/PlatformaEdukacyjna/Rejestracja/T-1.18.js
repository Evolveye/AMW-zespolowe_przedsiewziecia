/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-1-18', () => {
    it(dane.rejestracja.t1_18.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Rejestracja').click()
      //fill form
      if(dane.rejestracja.t1_18.imie != ""){
        cy.get('[name="name"]').type(dane.rejestracja.t1_18.imie)
      }else{
        cy.get('[name="name"]').invoke('val', '')
      }

      if(dane.rejestracja.t1_18.nazwisko != ""){
        cy.get('[name="surname"]').type(dane.rejestracja.t1_18.nazwisko)
      }else{
        cy.get('[name="surname"]').invoke('val', '')
      }

      if(dane.rejestracja.t1_18.email != ""){
        cy.get('[name="email"]').type(dane.rejestracja.t1_18.email)
      }else{
        cy.get('[name="email"]').invoke('val', '')
      }

      if(dane.rejestracja.t1_18.haslo1 != ""){
        cy.get('[name="password1"]').type(dane.rejestracja.t1_18.haslo1)
      }else{
        cy.get('[name="password1"]').invoke('val', '')
      }

      if(dane.rejestracja.t1_18.haslo2 != ""){
        cy.get('[name="password2"]').type(dane.rejestracja.t1_18.haslo2)
      }else{
        cy.get('[name="password2"]').invoke('val', '')
      }


  
      cy.get('form > .neumorphizm').click()

      cy.wait(700)
      cy.contains(dane.rejestracja.t1_18.error)
    })
  })