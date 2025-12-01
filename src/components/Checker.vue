<template>
  <footer>
    <article style="margin-bottom: 0">
      <header>Alcohol Checker</header>
      <section class="grid">
        <button @click="add" class="outline">Add</button>
        <button @click="subtract" class="outline">Subtract</button>
      </section>
      <table class="marginless">
        <thead>
          <tr>
            <th>Units consumed</th>
            <th>Borderline time</th>
            <th>Safe time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ count }}</td>
            <td>{{ limitTime }}</td>
            <td>{{ soberTime }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      limitTime: '',
      soberTime: ''
    }
  },
  watch: {
    count: 'updateTimes'
  },
  mounted() {
    this.updateTimes()
  },
  methods: {
    updateTimes() {
      const options = {
        hour: '2-digit',
        minute: '2-digit'
      }
      const currentTime = new Date().getTime()
      if (this.count === 0) {
        this.limitTime = new Date(currentTime).toLocaleTimeString([], options)
        this.soberTime = new Date(currentTime).toLocaleTimeString([], options)
      } else {
        this.limitTime = new Date(
          currentTime + this.count * 60 * 60 * 1000
        ).toLocaleTimeString([], options)
        this.soberTime = new Date(
          currentTime + (this.count + 1) * 60 * 60 * 1000
        ).toLocaleTimeString([], options)
      }
    },
    add() {
      this.count++
    },
    subtract() {
      if (this.count > 0) {
        this.count--
      }
    }
  }
}
</script>
