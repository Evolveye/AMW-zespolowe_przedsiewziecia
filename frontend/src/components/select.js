import React from "react"
import { getToken } from "../utils/auth"

export default class Select extends React.Component {
  state = {
    options: [<option key="empty">empty</option>],
  }

  ref = React.createRef()

  componentDidMount() {
    const { autoFetch, refetchSetter } = this.props

    if (autoFetch === undefined || autoFetch) this.fetch()
    if (refetchSetter) refetchSetter(this.fetch)
  }

  fetch = () => {
    const {
      fetchDataAddress,
      fetchDataFilter,
      fetchDataProcessor,
      fetchGetDataName,
      onChange,
    } = this.props

    fetch(fetchDataAddress, {
      headers: { Authentication: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(data => data[fetchGetDataName])
      .then(arr =>
        fetchDataFilter
          ? arr.filter(field => this.props.fetchDataFilter(field))
          : arr
      )
      .then(arr =>
        fetchDataProcessor
          ? arr.map(field => this.props.fetchDataProcessor(field))
          : arr
      )
      .then(arr =>
        arr.map(field =>
          typeof field === `string` ? { value: field, text: field } : field
        )
      )
      .then(arr =>
        arr.map(({ value, text }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))
      )
      .then(options => this.setState({ options }))
      .then(() => onChange && onChange(this.ref.current))
  }

  render = () => (
    <select
      name={this.props.name}
      ref={this.ref}
      onBlur={this.props.onChange}
      disabled={this.props.disabled ?? false}
    >
      {this.state.options}
    </select>
  )
}
