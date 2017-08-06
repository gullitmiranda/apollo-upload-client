function isObject(value) {
  return value === Object(value)
}

function isFile(value) {
  return value instanceof File
}

function makeArrayKey(key) {
  if (key.length > 2 && key.lastIndexOf('[]') === key.length - 2) {
    return key
  } else {
    return key + '[]'
  }
}

export function objectToFormData(object, formData, parentPath) {
  formData = formData || new FormData()

  Object.keys(object).forEach(key => {
    let path = `${key}`
    if (parentPath) {
      path = `${parentPath}[${path}]`
    }

    let value = object[key]

    // when array have object, treat array as an object indexed
    const isArrayWithoutObject =
      Array.isArray(value) && !value.find(item => isObject(item))

    if (isArrayWithoutObject) {
      value.forEach(function(value) {
        var arrayKey = makeArrayKey(key)

        if (isObject(value) && !isFile(value)) {
          objectToFormData(value, formData, arrayKey)
        } else {
          formData.append(arrayKey, value)
        }
      })
    } else if (isObject(value) && !isFile(value)) {
      objectToFormData(value, formData, path)
    } else {
      formData.append(path, value)
    }
  })

  return formData
}

export default objectToFormData
