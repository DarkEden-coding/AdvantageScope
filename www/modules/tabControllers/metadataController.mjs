// Controls rendering of metadata table
export class MetadataController {
  #noDataAlert = null
  #tableContainer = null
  #tableBody = null

  constructor(content) {
    this.#noDataAlert = content.getElementsByClassName("tab-centered")[0]
    this.#tableContainer = content.getElementsByClassName("metadata-table-container")[0]
    this.#tableBody = content.getElementsByClassName("metadata-table")[0].firstElementChild
  }

  // Standard function: retrieves current state
  get state() {
    return {}
  }

  // Standard function: restores state where possible
  set state(newState) {
    // Nothing to restore, just reset everything

    // Remove old rows
    while (this.#tableBody.childElementCount > 1) {
      this.#tableBody.removeChild(this.#tableBody.lastChild)
    }

    // Exit if log not ready
    if (log == null) return

    // Get data
    var tree = log.getFieldTree()
    var data = {}
    if ("RealMetadata" in tree) {
      for (let [key, value] of Object.entries(tree["RealMetadata"].children)) {
        if (!(key in data)) {
          data[key] = {}
        }
        data[key].real = log.getDataInRange(value.field, 0, 0, 0).values[0]
      }
    }
    if ("ReplayMetadata" in tree) {
      for (let [key, value] of Object.entries(tree["ReplayMetadata"].children)) {
        if (!(key in data)) {
          data[key] = {}
        }
        data[key].replay = log.getDataInRange(value.field, 0, 0, 0).values[0]
      }
    }

    // Add rows
    var keys = Object.keys(data)
    keys.sort()
    keys.forEach(key => {
      var row = document.createElement("tr")
      this.#tableBody.appendChild(row)
      for (let i = 0; i < 3; i++) {
        row.appendChild(document.createElement("td"))
      }
      row.children[0].innerText = key
      if ("real" in data[key]) {
        row.children[1].innerText = data[key].real
      } else {
        row.children[1].innerText = "NA"
        row.children[1].classList.add("no-data")
      }
      if ("replay" in data[key]) {
        row.children[2].innerText = data[key].replay
      } else {
        row.children[2].innerText = "NA"
        row.children[2].classList.add("no-data")
      }
    })

    // Show/hide table
    var showTable = keys.length > 0
    this.#noDataAlert.hidden = showTable
    this.#tableContainer.hidden = !showTable
  }

  // Called by tab controller when side bar size changes
  sideBarResize() { }

  // Called every 15ms by the tab controller
  periodic() { }
}