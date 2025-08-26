---
trigger: always_on
description: 
globs: 
---

i have an external app in c:\repos\findus (Findus) which is an expo / yarn project.
in its package.json this package is included as:

"tcomb-form-native": "file:../tcomb-form-native"

as a drop in replacement for development.

This package here is located at: c:\repos\tcomb-form-native


My external App (Findus) imports it like so (this may not be changed!):

import { createRef, RefObject, useCallback, useContext, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import t from 'tcomb-form-native'
import transform from 'tcomb-json-schema'

import { ListComponentTcomb } from './ListComponentTcomb'

import { ThemeContext } from '@/context/ThemeContext'
import { TypesContext } from '@/context/TypesContext'
import { UserContext } from '@/context/UserContext'
import { TYPE_CLIENT, TYPE_USER } from '@/utils/documentApi'
import { extractSchemaOptions } from '@/utils/schema'

transform.resetFormats()
transform.registerFormat('color', t.String)
transform.registerFormat('date', t.Date)
transform.registerFormat('time', t.Date)
transform.registerFormat('datetime', t.Date)
transform.registerFormat('person', t.String)
transform.registerFormat('children', t.String)
transform.registerFormat('user', t.String)
transform.registerFormat('client', t.String)
transform.registerFormat('address', t.String)
transform.registerFormat('theme', t.String)
transform.registerFormat('serviceProvider', t.String)
transform.registerFormat('service', t.String)
transform.registerFormat('email', (x: string) => /(.)+@(.)+/.test(x))
transform.registerFormat('image', t.String)

t.form.Textbox.numberTransformer = {
  format: (value: string | number) => (t.Nil.is(value) ? null : String(value)),
  parse: (value: string) => {
    if (value) value = value.replace(/,/g, '.')

    return Number(value) || null
  }
}

type Props = {
  document: DocumentData
  onChange?: (values: DocumentData) => void | DocumentData
  onSubmit?: (values: DocumentData) => void | DocumentData
  submitButtonRef?: RefObject<HTMLButtonElement>
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
const Form = t.form.Form
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
Form.templates.list = ListComponentTcomb

export const formRef = createRef<{ getValue: () => DocumentData }>()

export function SchemaForm({ document, onChange }: Props) {
  const {
    theme: {
      components: { colors }
    }
  } = useContext(ThemeContext)
  const { user, isTenantAdmin, isAdmin, isReseller } = useContext(UserContext)
  const { documentTypes } = useContext(TypesContext)
  const [value, setValue] = useState<DocumentData>(document)

  const handleOnChange = useCallback(
    (change: DocumentData) => {
      setValue(change)
      if (typeof onChange === 'function') {
        onChange(change)
      }
    },
    [onChange]
  )

  const schema = useMemo(
    () => (documentTypes[document.type] ? documentTypes[document.type].schema : undefined),
    [document.type, documentTypes]
  )
  const schemaOptions = useMemo(
    () => (schema ? extractSchemaOptions(schema) : { fields: {} }),
    [schema]
  )
  const transformedSchema = useMemo(() => (schema ? transform(schema) : {}), [schema])

  schemaOptions.fields!.disabled = useMemo(
    () =>
      !isAdmin && !isReseller && !isTenantAdmin && document && document.type === TYPE_USER
        ? { hidden: true }
        : schemaOptions.fields!.disabled,
    [document, isAdmin, isReseller, isTenantAdmin, schemaOptions.fields]
  )
  schemaOptions.fields!.tenantAdmin = useMemo(
    () =>
      !isAdmin && !isReseller && !isTenantAdmin && document && document.type === TYPE_USER
        ? { hidden: true }
        : schemaOptions.fields!.tenantAdmin,
    [document, isAdmin, isReseller, isTenantAdmin, schemaOptions.fields]
  )
  schemaOptions.fields!.coordinatedClients = useMemo(
    () =>
      !isAdmin && !isReseller && !isTenantAdmin && document && document.type === TYPE_USER
        ? { hidden: true }
        : schemaOptions.fields!.coordinatedClients,
    [document, isAdmin, isReseller, isTenantAdmin, schemaOptions.fields]
  )
  schemaOptions.fields!.email = useMemo(
    () =>
      !isAdmin &&
      !isReseller &&
      !isTenantAdmin &&
      document &&
      document.id &&
      document.type === TYPE_USER
        ? { editable: false }
        : schemaOptions.fields!.email,
    [document, isAdmin, isReseller, isTenantAdmin, schemaOptions.fields]
  )
  schemaOptions.fields!.assignedUsers = useMemo(
    () =>
      !isAdmin &&
      !isReseller &&
      !isTenantAdmin &&
      !user.coordinatedClients?.includes(document.id) &&
      document &&
      document.type === TYPE_CLIENT
        ? { hidden: true }
        : schemaOptions.fields!.assignedUsers,
    [document, isAdmin, isReseller, isTenantAdmin, schemaOptions.fields, user.coordinatedClients]
  )

  if (!document || document.deleted) {
    return null
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Form
        options={schemaOptions}
        ref={formRef}
        onChange={(data: DocumentData) => handleOnChange(data)}
        value={value}
        type={transformedSchema}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '100%',
    elevation: 3,
    shadowOffset: {
      height: 2,
      width: 1
    },
    shadowOpacity: 0.3,
    shadowRadius: 2
  }
})

ListComponentTcomb.tsx (also may not be changed):

import React, { memo } from 'react'
import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native'

type Button = {
  click: () => void
  label: string
  type: string
}

type Item = {
  buttons: Button[]
  key: string
  input: React.ReactElement | null
}

type RowButtonProps = {
  button: Button
  stylesheet: { [index: string]: { [index: string]: TextStyle } }
}

type ButtonGroupProps = {
  buttons: Button[]
  stylesheet: { [index: string]: { [index: string]: TextStyle } }
}

type RowProps = {
  item: Item
  stylesheet: { [index: string]: { [index: string]: TextStyle } }
}

type Props = {
  add: Button
  error: string
  hasError: boolean
  hidden: boolean
  items: Item[]
  label: string
  stylesheet: { [index: string]: { [index: string]: TextStyle } }
}

// Components
const RowButton = memo<RowButtonProps>(({ button, stylesheet }) => (
  <Pressable key={button.type} style={[stylesheet.button, styles.button]} onPress={button.click}>
    <Text style={stylesheet.buttonText}>{button.label}</Text>
  </Pressable>
))

const ButtonGroup = memo<ButtonGroupProps>(({ buttons, stylesheet }) => (
  <View style={styles.buttonGroup}>
    {buttons.map(button => (
      <RowButton key={button.type} button={button} stylesheet={stylesheet} />
    ))}
  </View>
))

const Row = memo<RowProps>(({ item, stylesheet }) => (
  <View key={item.key} style={styles.row}>
    <View style={styles.input}>{item.input}</View>
    <ButtonGroup buttons={item.buttons} stylesheet={stylesheet} />
  </View>
))

export function ListComponentTcomb({
  add,
  error,
  hasError,
  hidden,
  items,
  label,
  stylesheet
}: Props) {
  const controlLabelStyle = hasError
    ? stylesheet.controlLabel.error
    : stylesheet.controlLabel.normal
  const addButton = add && <RowButton button={add} stylesheet={stylesheet} />

  return (
    <View style={hidden ? styles.hidden : stylesheet.fieldset}>
      {label && <Text style={controlLabelStyle}>{label}</Text>}
      {hasError && error && (
        <Text accessibilityLiveRegion='polite' style={stylesheet.errorBlock}>
          {error}
        </Text>
      )}
      {items.map(item =>
        item.buttons.length === 0 ? (
          <View key={item.key}>{item.input}</View>
        ) : (
          <Row key={item.key} item={item} stylesheet={stylesheet} />
        )
      )}
      {addButton}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    elevation: 3,
    height: 26,
    marginRight: 5,
    padding: 0,
    shadowOffset: {
      height: 2,
      width: 1
    },
    shadowOpacity: 0.3,
    shadowRadius: 2
  },
  buttonGroup: {
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: -8
  },
  input: {
    flexGrow: 1
  },
  row: {
    flexDirection: 'row'
  },
  hidden: {
    display: 'none'
  }
})

