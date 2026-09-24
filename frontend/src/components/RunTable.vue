<script setup>
defineProps({
  runs: { type: Array, default: () => [] },
})
defineEmits(['open'])
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Run</th><th>Driver</th><th>Status</th><th>Cash</th><th></th></tr></thead>
      <tbody>
        <tr v-for="run in runs" :key="run.name">
          <td>{{ run.name }}</td><td>{{ run.driver }}</td><td><span class="badge">{{ run.run_status }}</span></td><td>{{ run.total_cash_collected }}</td>
          <td><button class="secondary" @click="$emit('open', run)">View</button></td>
        </tr>
        <tr v-if="!runs.length"><td colspan="5" class="empty">No runs found.</td></tr>
      </tbody>
    </table>
  </div>
</template>
